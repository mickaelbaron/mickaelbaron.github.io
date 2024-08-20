---
title: "A step-by-step pratical guide for deploying NVIDIA GPUs on Kubernetes"
tags: [kubernetes]
category: technical
description: "This blog post shows how to build a Kubernetes (k8s) cluster that takes GPU resources into account."
english: true
toc: true
comments: utterances
---

This blog post guides you through the creation of a Kubernetes cluster with NVIDIA GPU resources. We will use the **kubeadm** deployment tool to setup the Kubernetes cluster. For the discovery and configuration of nodes with GPU cards, we will integrate [GPU Operator](https://github.com/NVIDIA/gpu-operator). Finally, we will deploy the [Ollama](https://ollama.com/) application on the cluster and verify that it correctly uses the GPU resources.

This experiment was validated by the intern Frédéric Alleron, student in the Network and Telecom department at the IUT Châtellerault, who completed his internship from June to July 2024 at the LIAS laboratory.

## Prerequisites

The hardware prerequisites to reproduce this experiment are:

- two Linux machines (my setup: Ubuntu 22.04 LTS), one of which has at least one NVIDIA GPU (my setup: NVIDIA P400 with 2GB). The disk size and memory are not important,
- a client machine (my setup: macOS Sonoma) for accessing the Kubernetes cluster.

Since the component [GPU Operator](https://github.com/NVIDIA/gpu-operator), which allows the installation of NVIDIA GPU support on Kubernetes, does not support version 24.04 LTS ([platform-support.html](https://docs.nvidia.com/datacenter/cloud-native/gpu-operator/latest/platform-support.html)), we will limit ourselves to Ubuntu 22.04 LTS.

The three machines are identified in the network as follows:

- client machine: 192.140.161.102,
- master/worker node (one with GPU): 192.140.161.103 named `k8s-gpu-node1`,
- worker node: 192.140.161.104 named `k8s-gpu-node2`.

Versions of the used components/tools:

- containerd: 1.7.19,
- runC: 1.1.13,
- kubeadm, kubelet, kubectl: 1.30.3,
- helm: 3.15.3,
- Cilium: 1.15.6,
- Kubenetes: 1.30.3.

For learning about Kubernetes, you can consult my training courses:

- course material: [Mise en œuvre d'architectures microservices avec Kubernetes 🇫🇷](https://mickael-baron.fr/soa/microservices-mise-en-oeuvre-kubernetes) ;
- hands on lab: [Tutoriel Microservices avec Kubernetes - Les bases de K8s 🇫🇷](https://github.com/mickaelbaron/microservices-kubernetes-gettingstarted-tutorial).

## Kubernetes nodes configuration

This section details the configuration of both nodes prior to setting up the Kubernetes cluster (installation of components and operating system configuration). All operations must be performed identically on all nodes.

* Update the repositories and install the latest versions of packages already present on the operating system.

```
$ sudo apt-get update
$ sudo apt-get upgrade -y
```

A Kubernetes cluster requires a **container runtime manager** on each cluster node. The container runtime manager is responsible for managing the entire lifecycle of containers, including image management, container startup and shutdown. We will use [Containerd](https://github.com/containerd/containerd), which appears to be the most widely used. An incomplete list of various container runtimes is available at [https://kubernetes.io/docs/setup/production-environment/container-runtimes](https://kubernetes.io/docs/setup/production-environment/container-runtimes).

* Download the latest current version of [Containerd](https://github.com/containerd/containerd) from GitHub and extract the contents into the directory _/usr/local/_.

```
$ wget https://github.com/containerd/containerd/releases/download/v1.7.19/containerd-1.7.19-linux-amd64.tar.gz
$ sudo tar -C /usr/local -xzvf containerd-1.7.19-linux-amd64.tar.gz
```

* Download the **containerd** service description file.

```
$ wget https://raw.githubusercontent.com/containerd/containerd/main/containerd.service
$ sudo mv containerd.service /lib/systemd/system/containerd.service
```

* Start the **containerd** service using the command below.

```
$ sudo systemctl daemon-reload
$ sudo systemctl enable --now containerd
```

* Verify that the **containerd** service is started.

```
$ sudo systemctl status containerd
● containerd.service - containerd container runtime
     Loaded: loaded (/lib/systemd/system/containerd.service; enabled; vendor preset: enabled)
     Active: active (running) since Mon 2024-07-15 14:11:19 UTC; 1min 1s ago
       Docs: https://containerd.io
    Process: 2449 ExecStartPre=/sbin/modprobe overlay (code=exited, status=0/SUCCESS)
   Main PID: 2450 (containerd)
      Tasks: 9
     Memory: 13.7M
        CPU: 148ms
     CGroup: /system.slice/containerd.service
             └─2450 /usr/local/bin/containerd

Jul 15 14:11:19 k8s-gpu-node1 containerd[2450]: time="2024-07-15T14:11:19.305055646Z" level=info msg="Start subscribing containerd event"
Jul 15 14:11:19 k8s-gpu-node1 containerd[2450]: time="2024-07-15T14:11:19.305117731Z" level=info msg="Start recovering state"
Jul 15 14:11:19 k8s-gpu-node1 containerd[2450]: time="2024-07-15T14:11:19.305182076Z" level=info msg="Start event monitor"
Jul 15 14:11:19 k8s-gpu-node1 containerd[2450]: time="2024-07-15T14:11:19.305200106Z" level=info msg="Start snapshots syncer"
Jul 15 14:11:19 k8s-gpu-node1 containerd[2450]: time="2024-07-15T14:11:19.305216073Z" level=info msg="Start cni network conf syncer for default"
Jul 15 14:11:19 k8s-gpu-node1 containerd[2450]: time="2024-07-15T14:11:19.305229234Z" level=info msg="Start streaming server"
Jul 15 14:11:19 k8s-gpu-node1 containerd[2450]: time="2024-07-15T14:11:19.305092597Z" level=info msg=serving... address=/run/containerd/containerd.sock.ttrpc
Jul 15 14:11:19 k8s-gpu-node1 containerd[2450]: time="2024-07-15T14:11:19.305368243Z" level=info msg=serving... address=/run/containerd/containerd.sock
Jul 15 14:11:19 k8s-gpu-node1 containerd[2450]: time="2024-07-15T14:11:19.305468660Z" level=info msg="containerd successfully booted in 0.033130s"
Jul 15 14:11:19 k8s-gpu-node1 systemd[1]: Started containerd container runtime.
```

[Containerd](https://github.com/containerd/containerd) is associated with a **container runtime** that interacts directly with the Linux kernel to configure and run containers. We will use [runC](https://github.com/opencontainers/runc), which also appears to be widely used.

* Download the latest current version of [runC](https://github.com/opencontainers/runc) from GitHub and install it in the directory _/usr/local/sbin_.

```
$ wget https://github.com/opencontainers/runc/releases/download/v1.1.13/runc.amd64
$ sudo install -m 755 runc.amd64 /usr/local/sbin/runc
```

* From the configuration of [Containerd](https://github.com/containerd/containerd), the **CGroup** driver for [runC](https://github.com/opencontainers/runc) must be configured.

```
$ sudo mkdir -p /etc/containerd/
$ containerd config default | sudo tee /etc/containerd/config.toml
$ sudo sed -i 's/SystemdCgroup \= false/SystemdCgroup \= true/g' /etc/containerd/config.toml
```

* Restart [Containerd](https://github.com/containerd/containerd) to apply the previous modifications.

```
$ sudo systemctl restart containerd
```

* Ensure that the [Containerd](https://github.com/containerd/containerd) service is still running.

```
$ systemctl status containerd
● containerd.service - containerd container runtime
     Loaded: loaded (/lib/systemd/system/containerd.service; enabled; vendor preset: enabled)
     Active: active (running) since Mon 2024-07-15 14:51:27 UTC; 17min ago
       Docs: https://containerd.io
    Process: 2907 ExecStartPre=/sbin/modprobe overlay (code=exited, status=0/SUCCESS)
   Main PID: 2908 (containerd)
      Tasks: 9
     Memory: 14.0M
        CPU: 1.295s
     CGroup: /system.slice/containerd.service
             └─2908 /usr/local/bin/containerd

Jul 15 14:51:27 k8s-gpu-node1 containerd[2908]: time="2024-07-15T14:51:27.678801098Z" level=info msg="Start subscribing containerd event"
Jul 15 14:51:27 k8s-gpu-node1 containerd[2908]: time="2024-07-15T14:51:27.678888229Z" level=info msg="Start recovering state"
Jul 15 14:51:27 k8s-gpu-node1 containerd[2908]: time="2024-07-15T14:51:27.678895101Z" level=info msg=serving... address=/run/containerd/containerd.sock.ttrpc
Jul 15 14:51:27 k8s-gpu-node1 containerd[2908]: time="2024-07-15T14:51:27.678980481Z" level=info msg=serving... address=/run/containerd/containerd.sock
Jul 15 14:51:27 k8s-gpu-node1 containerd[2908]: time="2024-07-15T14:51:27.678988030Z" level=info msg="Start event monitor"
Jul 15 14:51:27 k8s-gpu-node1 containerd[2908]: time="2024-07-15T14:51:27.679069975Z" level=info msg="Start snapshots syncer"
Jul 15 14:51:27 k8s-gpu-node1 containerd[2908]: time="2024-07-15T14:51:27.679091006Z" level=info msg="Start cni network conf syncer for default"
Jul 15 14:51:27 k8s-gpu-node1 containerd[2908]: time="2024-07-15T14:51:27.679129596Z" level=info msg="Start streaming server"
Jul 15 14:51:27 k8s-gpu-node1 containerd[2908]: time="2024-07-15T14:51:27.679219448Z" level=info msg="containerd successfully booted in 0.029455s"
Jul 15 14:51:27 k8s-gpu-node1 systemd[1]: Started containerd container runtime.
```

Some components (**kubelet**, for example) of Kubernetes do not work well with Linux SWAP. Therefore, Linux SWAP must be disabled.

* Disable Linux SWAP without rebooting and permanently way from by editing the _etc/fstab_ file.

```
$ sudo swapoff -a
$ sudo sed -i '/swap/s/^/#/' /etc/fstab
```

The Linux kernel does not allow IPv4 packet routing between interfaces by default.

* Enable NAT/PAT.

```
cat <<EOF | sudo tee /etc/sysctl.d/k8s.conf
net.ipv4.ip_forward = 1
EOF

sudo sysctl --system
```

Four tools will be installed: **kubelet**, **kubeadm**, **kubectl** and **helm**. The first tool **kubelet** is responsible for the runtime state on each node, ensuring all containers run within a Pod. The second tool **kubeadm** handles cluster creation. The third **kubectl** is a command-line utility for administering the Kubernetes cluster. Finally, **helm** is a tool used to define, install, and upgrade applications using *charts* for Kubernetes. 

**Note** that **kubectl** and **helm** are client tools and are not necessarily required on cluster nodes. However, they are required on the client machine.

* Install **kubelet**, **kubeadm** and **kubectl**.

```
$ sudo apt-get update
$ sudo apt-get install -y apt-transport-https ca-certificates curl gpg

$ curl -fsSL https://pkgs.k8s.io/core:/stable:/v1.30/deb/Release.key | sudo gpg --dearmor -o /etc/apt/keyrings/kubernetes-apt-keyring.gpg
$ echo 'deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] https://pkgs.k8s.io/core:/stable:/v1.30/deb/ /' | sudo tee /etc/apt/sources.list.d/kubernetes.list

$ sudo apt-get update
$ sudo apt-get install -y kubelet kubeadm kubectl
$ sudo apt-mark hold kubelet kubeadm kubectl
```

* Install **helm**.

```
$ curl -fsSL -o get_helm.sh https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3
$ chmod 700 get_helm.sh
$ ./get_helm.sh
```

* Enable and start the **kubelet** service.

```
$ sudo systemctl daemon-reload
$ sudo systemctl enable --now kubelet
$ sudo systemctl start kubelet
```

* Get the status of the **kubelet** component.

```
$ systemctl status kubelet
● kubelet.service - kubelet: The Kubernetes Node Agent
     Loaded: loaded (/usr/lib/systemd/system/kubelet.service; enabled; preset: enabled)
    Drop-In: /usr/lib/systemd/system/kubelet.service.d
             └─10-kubeadm.conf
     Active: activating (auto-restart) (Result: exit-code) since Mon 2024-07-15 15:31:41 UTC; 3s ago
       Docs: https://kubernetes.io/docs/
    Process: 11727 ExecStart=/usr/bin/kubelet $KUBELET_KUBECONFIG_ARGS $KUBELET_CONFIG_ARGS $KUBELET_KUBEADM_ARGS $KUBELET_EXTRA_ARGS (code=exited, status=1/FAILURE)
   Main PID: 11727 (code=exited, status=1/FAILURE)
        CPU: 47ms
```

You can see that the **kubelet** component is enabled but not started; it will become active once the cluster is set up.

## Client machine configuration

On the client machine, the **kubectl** and **helm** tools will be necessary. Below, we detail the installation of these tools on macOS and Linux.

**macOS**: to install **kubectl** and **helm** via [Homebrew](https://brew.sh/).

```
$ brew install kubectl helm
```

**Linux** : to install **kubectl** and **helm** on any Linux distribution.

```
# kubectl
$ curl -LO https://storage.googleapis.com/kubernetes-release/release/$(curl -s https://storage.googleapis.com/kubernetes-release/release/stable.txt)/bin/linux/amd64/kubectl
$ chmod +x ./kubectl
$ sudo mv ./kubectl /usr/local/bin/kubectl

# helm
$ curl -fsSL -o get_helm.sh https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3
$ chmod 700 get_helm.sh
$ ./get_helm.sh
```

## Create a Kubernetes cluster 

This section shows how to create a Kubernetes cluster using the **kubeadm** tool. **kubeadm** is a command-line tool for managing a Kubernetes cluster by installing various components. Only **kubelet** needs to be installed before, as described in the previous section. 

* From the master node (`k8s-gpu-node1`), initialize the Kubernetes cluster.

```
$ sudo kubeadm init --node-name node-master` --cri-socket /run/containerd/containerd.sock
...
Your Kubernetes control-plane has initialized successfully!

To start using your cluster, you need to run the following as a regular user:

  mkdir -p $HOME/.kube
  sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
  sudo chown $(id -u):$(id -g) $HOME/.kube/config

Alternatively, if you are the root user, you can run:

  export KUBECONFIG=/etc/kubernetes/admin.conf

You should now deploy a pod network to the cluster.
Run "kubectl apply -f [podnetwork].yaml" with one of the options listed at:
  https://kubernetes.io/docs/concepts/cluster-administration/addons/

Then you can join any number of worker nodes by running the following on each as root:

kubeadm join 192.140.161.103:6443 --token YOUR_TOKEN \
	--discovery-token-ca-cert-hash sha256:YOUR_CA_CERT_HASH
```

* At the end of the installation, you will be prompted to perform some operations to access the Kubernetes cluster. The first one involves storing the Kubernetes cluster access information in _$HOME/.kube/config_. This file can be used by **kubectl** to interact with the cluster. The second operation is to add a node to the Kubernetes cluster.

```
$ mkdir -p $HOME/.kube
$ sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
$ sudo chown $(id -u):$(id -g) $HOME/.kube/config
```

* To allow the client machine to connect to the Kubernetes cluster, copy the _config_ file from master node (`k8s-gpu-node1`) to the client machine.

```
$ mkdir $PWD/.kube
$ scp k8suser@192.140.161.103:/home/k8suser/.kube/config $PWD/.kube
```

* Still from the client machine, test the communication with the Kubernetes cluster.

```
$ kubectl get nodes
NAME          STATUS     ROLES           AGE   VERSION
node-master   NotReady   control-plane   25h   v1.30.3
```

* The master node is currently the only node in the Kubernetes cluster. Additionally, our cluster cannot schedule Pods on this master node for security reasons. Since our cluster may not have many nodes, the security feature will be disabled.

```
$ kubectl taint nodes node-master node-role.kubernetes.io/control-plane-
$ kubectl label nodes node-master node.kubernetes.io/exclude-from-external-load-balancers-
```

* To re-enable this security feature.

```
$ kubectl taint nodes node-master node-role.kubernetes.io/control-plane:NoSchedule
$ kubectl label nodes node-master node.kubernetes.io/exclude-from-external-load-balancers=true
```

Let's add a second node to the Kubernetes cluster.

* Connect to the worker node `k8s-gpu-node2` and execute the following command-line instructions.

```
$ sudo kubeadm join 192.140.161.103:6443 --token gf8ui6.ulo4gcme68k7j1zv \
	--discovery-token-ca-cert-hash sha256:2563ef8edc1fb9e4bdfdde6c0e723b9812647405be819eff95596eeae0ac254e
[preflight] Running pre-flight checks
[preflight] Reading configuration from the cluster...
[preflight] FYI: You can look at this config file with 'kubectl -n kube-system get cm kubeadm-config -o yaml'
[kubelet-start] Writing kubelet configuration to file "/var/lib/kubelet/config.yaml"
[kubelet-start] Writing kubelet environment file with flags to file "/var/lib/kubelet/kubeadm-flags.env"
[kubelet-start] Starting the kubelet
[kubelet-check] Waiting for a healthy kubelet. This can take up to 4m0s
[kubelet-check] The kubelet is healthy after 507.199197ms
[kubelet-start] Waiting for the kubelet to perform the TLS Bootstrap

This node has joined the cluster:
* Certificate signing request was sent to apiserver and a response was received.
* The Kubelet was informed of the new secure connection details.

Run 'kubectl get nodes' on the control-plane to see this node join the cluster.
```

The values for the `--token` and `--discovery-token-ca-cert-hash` parameters are provided during the creation of the Kubernetes cluster. However, the token value is valid for only 24 hours and you may not have had time to save this information from the console. Don't worry, both pieces of information can be retrieved from the master node.

* To retrieve the token value (`--token`) if the 24-hour deadline has not been reached.

```
$ kubeadm token list
TOKEN                     TTL         EXPIRES                USAGES                   DESCRIPTION                                                EXTRA GROUPS
gf8ui6.ulo4gcme68k7j1zv   23h         2024-07-17T16:58:57Z   authentication,signing   <none>                                                     system:bootstrappers:kubeadm:default-node-token
```

* To generate a new value of the token.

```
$ kubeadm token create
zuku5f.gjtnq2bcupmg0902
$ kubeadm token list
TOKEN                     TTL         EXPIRES                USAGES                   DESCRIPTION                                                EXTRA GROUPS
gf8ui6.ulo4gcme68k7j1zv   23h         2024-07-17T16:58:57Z   authentication,signing   <none>                                                     system:bootstrappers:kubeadm:default-node-token
zuku5f.gjtnq2bcupmg0902   23h         2024-07-17T17:24:39Z   authentication,signing   <none>                                                     system:bootstrappers:kubeadm:default-node-token
```

* To retrieve the value of the certificate authority hash (`--discovery-token-ca-cert-hash`).

```
$ openssl x509 -in /etc/kubernetes/pki/ca.crt -pubkey -noout | openssl pkey -pubin -outform DER | openssl dgst -sha256
SHA2-256(stdin)= 2563ef8edc1fb9e4bdfdde6c0e723b9812647405be819eff95596eeae0ac254e
```

* From the client machine, check that both nodes are available.

```
$ kubectl get nodes
NAME            STATUS     ROLES           AGE   VERSION
k8s-gpu-node2   NotReady   <none>          15m   v1.30.3
node-master     NotReady   control-plane   25h   v1.30.3
```

* Also, ensure that the internal Kubernetes components installed by **kubeadm** are deployed.

```
$ kubectl get pods -n kube-system
NAME                                 READY   STATUS    RESTARTS   AGE
coredns-7db6d8ff4d-ht8wc             0/1     Pending   0          25h
coredns-7db6d8ff4d-rlzh5             0/1     Pending   0          25h
etcd-node-master                     1/1     Running   0          25h
kube-apiserver-node-master           1/1     Running   0          25h
kube-controller-manager-node-master  1/1     Running   0          25h
kube-proxy-f66kq                     1/1     Running   0          20m
kube-proxy-rvcxh                     1/1     Running   0          25h
kube-scheduler-node-master           1/1     Running   0          25h
```

In the previous outputs, both nodes are in `NotReady` status and the Pods `coredns-7db6d8ff4d-ht8wc` and `coredns-7db6d8ff4d-rlzh5` are not deployed. To resolve this issue, a network plugin compliant with the [CNI](https://github.com/containernetworking/cni) project must be installed. This will enable Pods to communicate within the Kubernetes cluster. 

There are numerous network plugins available, and the choice has been made to use [Cilium](https://github.com/cilium). [Cilium](https://github.com/cilium) offers the significant advantage of leveraging eBPF (extended Berkeley Packet Filter) technology, which has recently been integrated into Linux kernels. With eBPF, there is no need to load modules into the Linux kernel as was necessary with IPTables.

* From the master node, download the latest version of [Cilium](https://github.com/cilium).

```
$ CILIUM_CLI_VERSION=$(curl -s https://raw.githubusercontent.com/cilium/cilium-cli/main/stable.txt)
$ curl -L --remote-name-all https://github.com/cilium/cilium-cli/releases/download/${CILIUM_CLI_VERSION}/cilium-linux-amd64.tar.gz
$ sudo tar xzvfC cilium-linux-amd64.tar.gz /usr/local/bin
$ rm cilium-linux-amd64.tar.gz
```

* Install [Cilium](https://github.com/cilium). The installed version will be shown.

```
$ cilium install
ℹ️  Using Cilium version 1.15.6
🔮 Auto-detected cluster name: kubernetes
🔮 Auto-detected kube-proxy has been installed
```

* Wait a few seconds for the images to be downloaded and the pods to be deployed, and so check that the network plugin has been successfully installed.

```
$ cilium status
    /¯¯\
 /¯¯\__/¯¯\    Cilium:             OK
 \__/¯¯\__/    Operator:           OK
 /¯¯\__/¯¯\    Envoy DaemonSet:    disabled (using embedded mode)
 \__/¯¯\__/    Hubble Relay:       disabled
    \__/       ClusterMesh:        disabled

Deployment             cilium-operator    Desired: 1, Ready: 1/1, Available: 1/1
DaemonSet              cilium             Desired: 2, Ready: 2/2, Available: 2/2
Containers:            cilium             Running: 2
                       cilium-operator    Running: 1
Cluster Pods:          2/2 managed by Cilium
Helm chart version:
Image versions         cilium             quay.io/cilium/cilium:v1.15.6@sha256:6aa840986a3a9722cd967ef63248d675a87add7e1704740902d5d3162f0c0def: 2
                       cilium-operator    quay.io/cilium/operator-generic:v1.15.6@sha256:5789f0935eef96ad571e4f5565a8800d3a8fbb05265cf6909300cd82fd513c3d: 1
```

* From the client machine, verify that both nodes are available and operational.

```
kubectl get nodes
NAME            STATUS   ROLES           AGE   VERSION
k8s-gpu-node2   Ready    <none>          20h   v1.30.3
node-master     Ready    control-plane   45h   v1.30.3
```

The status of both nodes must be `Ready`.

## Add GPU support to the Kubernetes cluster

At this stage, a Kubernetes cluster with two nodes is configured. One of the nodes has a GPU card, but the Kubernetes cluster does not know that this node has a GPU. The goal of this section is to declare the GPU in the cluster and identify it as a resource, similar to a CPU or memory resource. However, configuring a GPU in a Kubernetes cluster is not trivial since it requires installing the GPU driver, identifying it with the container manager [Containerd](https://github.com/containerd/containerd), detecting and labeling the nodes with GPUs, and installing specific libraries (such as CUDA). NVIDIA has provided an operator called [GPU Operator](https://github.com/NVIDIA/gpu-operator) that simplifies all these tasks. This section aims to detail the installation of this operator.

* Create a namespace called `gpu-operator`. The [GPU Operator](https://github.com/NVIDIA/gpu-operator) will be deployed in this namespace.

```
$ kubectl create ns gpu-operator
namespace/gpu-operator created
```

* Add the NVIDIA **helm** repository.

```
$ helm repo add nvidia https://helm.ngc.nvidia.com/nvidia
```

* Install [GPU Operator](https://github.com/NVIDIA/gpu-operator).

```
$ helm install --wait --generate-name -n gpu-operator --create-namespace nvidia/gpu-operator
NAME: gpu-operator-1721224440
LAST DEPLOYED: Wed Jul 17 15:54:02 2024
NAMESPACE: gpu-operator
STATUS: deployed
REVISION: 1
TEST SUITE: None
```

* The operator will perform several tasks to discover that an NVIDIA GPU is available on the master node. New labels have been added to the description of the master node.

```
$ kubectl describe nodes node-master | grep nvidia.com
                    nvidia.com/cuda.driver-version.full=550.54.15
                    nvidia.com/cuda.driver-version.major=550
                    nvidia.com/cuda.driver-version.minor=54
                    nvidia.com/cuda.driver-version.revision=15
                    nvidia.com/cuda.driver.major=550
                    nvidia.com/cuda.driver.minor=54
                    nvidia.com/cuda.driver.rev=15
                    nvidia.com/cuda.runtime-version.full=12.4
                    nvidia.com/cuda.runtime-version.major=12
                    nvidia.com/cuda.runtime-version.minor=4
                    nvidia.com/cuda.runtime.major=12
                    nvidia.com/cuda.runtime.minor=4
                    nvidia.com/gfd.timestamp=1721229911
                    nvidia.com/gpu-driver-upgrade-state=upgrade-done
                    nvidia.com/gpu.compute.major=6
                    nvidia.com/gpu.compute.minor=1
                    nvidia.com/gpu.count=1
                    nvidia.com/gpu.deploy.container-toolkit=true
                    nvidia.com/gpu.deploy.dcgm=true
                    nvidia.com/gpu.deploy.dcgm-exporter=true
                    nvidia.com/gpu.deploy.device-plugin=true
                    nvidia.com/gpu.deploy.driver=true
                    nvidia.com/gpu.deploy.gpu-feature-discovery=true
                    nvidia.com/gpu.deploy.node-status-exporter=true
                    nvidia.com/gpu.deploy.nvsm=
                    nvidia.com/gpu.deploy.operator-validator=true
                    nvidia.com/gpu.family=pascal
                    nvidia.com/gpu.machine=Precision-3450
                    nvidia.com/gpu.memory=2048
                    nvidia.com/gpu.present=true
                    nvidia.com/gpu.product=Quadro-P400
                    nvidia.com/gpu.replicas=1
                    nvidia.com/gpu.sharing-strategy=none
                    nvidia.com/mig.capable=false
                    nvidia.com/mig.strategy=single
                    nvidia.com/mps.capable=false
                    nvidia.com/gpu-driver-upgrade-enabled: true
```

The previous description shows that a GPU is available: `nvidia.com/gpu.count=1`, and the detected card is a `Quadro-P400` with `2048` MB of memory.

* A Pod called `cuda-vectoradd` based on the image `nvcr.io/nvidia/k8s/cuda-sample:vectoradd-cuda12.5.0-ubuntu22.04` is deployed to verify that the GPU can be used by a program for GPU computations. Once the computations are completed, the Pod stops.

```
cat <<EOF | kubectl create -f - 
apiVersion: v1
kind: Pod
metadata:
  name: cuda-vectoradd
spec:
  restartPolicy: OnFailure
  containers:
  - name: cuda-vectoradd
    image: "nvcr.io/nvidia/k8s/cuda-sample:vectoradd-cuda12.5.0-ubuntu22.04"
    resources:
      limits:
        nvidia.com/gpu: 1
EOF
```

* Display the logs of the `cuda-vectoradd` pod.

```
$ kubectl logs pod/cuda-vectoradd
[Vector addition of 50000 elements]
Copy input data from the host memory to the CUDA device
CUDA kernel launch with 196 blocks of 256 threads
Copy output data from the CUDA device to the host memory
Test PASSED
Done
```

The GPU usage by the `cuda-vectoradd` Pod works perfectly. Let's now focus on an application that continuously uses the GPU and will demonstrate the utilization of a constrained GPU resource.

## Deploying an Application Requiring a GPU

The experimental application used will be [Ollama](https://ollama.com/). It is an application that exposes generative AI models, such as LLMs, via a REST API. It is possible to download LLM models and to run them either using only the CPU or by combining the CPU with a GPU to reduce execution time. The outcome of this experiment should demonstrate that if [Ollama](https://ollama.com/) utilizes a GPU resource, it is preempted and not available for other applications until [Ollama](https://ollama.com/) releases it. The [Ollama](https://ollama.com/) application is available through **helm**.

All the following operations will be performed from the client machine.

* Before deploying the [Ollama](https://ollama.com/) application, check that the GPU resource is available by querying the description of the master node.

```
$ kubectl describe nodes node-master
...
Allocated resources:
  (Total limits may be over 100 percent, i.e., overcommitted.)
  Resource           Requests    Limits
  --------           --------    ------
  cpu                1150m (9%)  500m (4%)
  memory             350Mi (1%)  690Mi (2%)
  ephemeral-storage  0 (0%)      0 (0%)
  hugepages-1Gi      0 (0%)      0 (0%)
  hugepages-2Mi      0 (0%)      0 (0%)
  nvidia.com/gpu     0           0
```

The resource identified by `nvidia.com/gpu` shows that it is not in use.

* Add the [Ollama](https://ollama.com/) **helm** repository.

```
$ helm repo add ollama-helm https://otwld.github.io/ollama-helm/
"ollama-helm" has been added to your repositories
```

* Create a `ollama` namespace to group all resources related to the [Ollama](https://ollama.com/) application.

```
$ kubectl create ns ollama
namespace/ollama created
```

* Deploy [Ollama](https://ollama.com/) application into the Kubernetes cluster.

```
$ helm install appli-ollama ollama-helm/ollama --namespace ollama --set ollama.gpu.enabled=true --set ollama.gpu.number=1 --set ollama.gpu.type=nvidia
NAME: appli-ollama
LAST DEPLOYED: Thu Jul 18 09:43:56 2024
NAMESPACE: ollama
STATUS: deployed
REVISION: 1
NOTES:
1. Get the application URL by running these commands:
  export POD_NAME=$(kubectl get pods --namespace ollama -l "app.kubernetes.io/name=ollama,app.kubernetes.io/instance=appli-ollama" -o jsonpath="{.items[0].metadata.name}")
  export CONTAINER_PORT=$(kubectl get pod --namespace ollama $POD_NAME -o jsonpath="{.spec.containers[0].ports[0].containerPort}")
  echo "Visit http://127.0.0.1:8080 to use your application"
  kubectl --namespace ollama port-forward $POD_NAME 8080:$CONTAINER_PORT
```

It specifies that GPU support must be enabled (`--set ollama.gpu.enabled=true`), the required number of GPUs is one (`--set ollama.gpu.number=1`) and the GPU type must be NVIDIA (`--set ollama.gpu.type=nvidia`).

* Check that the [Ollama](https://ollama.com/) application has been deployed (packaged into a Pod) on the master node that has the GPU.

```
$ kubectl get pods -n ollama -o wide
NAME                            READY   STATUS    RESTARTS   AGE     IP           NODE       
appli-ollama-8665457c88-gz8ch   1/1     Running   0          2m59s   10.0.0.242   node-master
```

The Pod (related to the [Ollama](https://ollama.com/) application) is correctly located on the master node.

In the deployment output for the [Ollama](https://ollama.com/) application, it is also explained how to use the deployed application via a port-forward. However, this is not the deployment method we will use; instead, we will use a classic `NodePort` service.

* Apply the following service configuration to expose [Ollama](https://ollama.com/) at the addresses `192.140.161.103:30001` and `192.140.161.104:30001`.

```
$ cat <<EOF | kubectl create  -n ollama -f - 
kind: Service
apiVersion: v1
metadata:
  name: ollamanodeportservice
spec:
  selector:
    app.kubernetes.io/name: ollama
  type: NodePort
  ports:
    - protocol: TCP
      targetPort: 11434
      port: 11434
      nodePort: 30001
  externalIPs:
    - 80.11.12.12
EOF
service/ollamanodeportservice created
```

* Execute the HTTP request to download the LLM model called `gemma:2b` in [Ollama](https://ollama.com/).

```
$ curl http://192.140.161.103:30001/api/pull -d '{
  "name": "gemma:2b"
}'
{"status":"pulling manifest"}
...
```

* Execute the HTTP request to generate a response to the given question.

```
$ curl http://192.140.161.103:30001/api/generate -d '{
  "model": "gemma:2b",
  "prompt": "Why is the sky blue?",
  "stream": false
}'
{"model":"gemma:2b","created_at":"2024-07-18T08:00:02.461703025Z","response":"The sky appears blue due to Rayleigh scattering. Rayleigh scattering is the scattering of light by small particles, such as molecules in the atmosphere. Blue light has a shorter wavelength than other colors of light, so it is scattered more strongly. This is why the sky appears blue.","done":true,"done_reason":"stop","context":[968,2997,235298,559,235298,15508,235313,1645,108,4385,603,573,8203,3868,181537,615,235298,559,235298,15508,235313,108,235322,2997,235298,559,235298,15508,235313,2516,108,651,8203,8149,3868,3402,577,153902,38497,235265,153902,38497,603,573,38497,576,2611,731,2301,16071,235269,1582,685,24582,575,573,13795,235265,7640,2611,919,476,25270,35571,1178,1156,9276,576,2611,235269,712,665,603,30390,978,16066,235265,1417,603,3165,573,8203,8149,3868,235265],"total_duration":4802224355,"load_duration":33326246,"prompt_eval_count":32,"prompt_eval_duration":324835000,"eval_count":55,"eval_duration":4400550000}
```

Everything is working correctly, [Ollama](https://ollama.com/) answers a question and generates a response quickly.

* Check the usage of the GPU to see if it has been preempted following the deployment of the [Ollama](https://ollama.com/) application.

```
$ kubectl describe nodes node-master
...
Allocated resources:
  (Total limits may be over 100 percent, i.e., overcommitted.)
  Resource           Requests    Limits
  --------           --------    ------
  cpu                1150m (9%)  500m (4%)
  memory             350Mi (1%)  690Mi (2%)
  ephemeral-storage  0 (0%)      0 (0%)
  hugepages-1Gi      0 (0%)      0 (0%)
  hugepages-2Mi      0 (0%)      0 (0%)
  nvidia.com/gpu     1           1
```

The GPU resources of the Kubernetes cluster are no longer available as they have all been preempted. Thus, if a Pod requiring GPU resources needs to be deployed, the Kubernetes cluster will put it on hold until the GPU resources are freed. To validate this scenario, we will deploy a new instance of [Ollama](https://ollama.com/).

* Create a `ollama2` namespace to group all resources related to the [Ollama](https://ollama.com/) application.

```
$ kubectl create ns ollama2
namespace/ollama2 created
```

* Deploy [Ollama](https://ollama.com/) application in the Kubernetes cluster within the `ollama2` namespace.

```
$ helm install appli-ollama ollama-helm/ollama --namespace ollama --set ollama.gpu.enabled=true --set ollama.gpu.number=1 --set ollama.gpu.type=nvidia
NAME: appli-ollama
LAST DEPLOYED: Thu Jul 18 09:43:56 2024
NAMESPACE: ollama
STATUS: deployed
REVISION: 1
NOTES:
1. Get the application URL by running these commands:
  export POD_NAME=$(kubectl get pods --namespace ollama -l "app.kubernetes.io/name=ollama,app.kubernetes.io/instance=appli-ollama" -o jsonpath="{.items[0].metadata.name}")
  export CONTAINER_PORT=$(kubectl get pod --namespace ollama $POD_NAME -o jsonpath="{.spec.containers[0].ports[0].containerPort}")
  echo "Visit http://127.0.0.1:8080 to use your application"
  kubectl --namespace ollama port-forward $POD_NAME 8080:$CONTAINER_PORT
```

* Display the status of the Pods in the `ollama2` namespace.

```
$ kubectl get pods -n ollama2
NAME                            READY   STATUS    RESTARTS   AGE
appli-ollama-8665457c88-ngtpf   0/1     Pending   0          116
```

As expected, the Pod is in the `Pending` state.

* Check the Pod's description to determine the reason for its `Pending` state.

```
$ kubectl describe pod appli-ollama -n ollama2
...
Events:
  Type     Reason            Age    From               Message
  ----     ------            ----   ----               -------
  Warning  FailedScheduling  3m24s  default-scheduler  0/2 nodes are available: 2 Insufficient nvidia.com/gpu. preemption: 0/2 nodes are available: 2 No preemption victims found for incoming pod.
```

As indicated in the message, no node in the cluster can accommodate this new Pod.

## Conclusion

This experiment showed the setup of a Kubernetes cluster and the discovery of GPU nodes via the [GPU Operator](https://github.com/NVIDIA/gpu-operator).

There are still many aspects to explore, particularly updating the components installed by the [GPU Operator](https://github.com/NVIDIA/gpu-operator) (drivers, libraries, etc.). It may also be worthwhile to examine how to manage NVIDIA cards with [MIG](https://docs.nvidia.com/datacenter/cloud-native/gpu-operator/latest/gpu-operator-mig.html) technology, which aims to partition a GPU into multiple sub-GPUs.

Stay tuned and give your feedbacks in the comments.

## Resources

* [https://docs.nvidia.com/datacenter/cloud-native/gpu-operator/latest/index.html](https://docs.nvidia.com/datacenter/cloud-native/gpu-operator/latest/index.html)
* [https://www.jimangel.io/posts/nvidia-rtx-gpu-kubernetes-setup/](https://www.jimangel.io/posts/nvidia-rtx-gpu-kubernetes-setup/)
* [https://blog.scottlowe.org/2019/08/15/reconstructing-the-join-command-for-kubeadm/](https://blog.scottlowe.org/2019/08/15/reconstructing-the-join-command-for-kubeadm/)
* [https://blog.scottlowe.org/2019/07/12/calculating-ca-certificate-hash-for-kubeadm/](https://blog.scottlowe.org/2019/07/12/calculating-ca-certificate-hash-for-kubeadm/)
* [https://github.com/otwld/ollama-helm](https://github.com/otwld/ollama-helm)