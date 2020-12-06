// Définition d'une constante.
const NEW_VALUE = 'Le contenu change';

// Une fonction nommée est définie.
function myFunction() {
    // Récupération de l'élément <p>.
    let myParagraph = document.querySelector('p');
    // Modification du contenu de l'élément <p>.
    myParagraph.textContent = NEW_VALUE;
    
    // Affichage d'un message sur la console.
    console.log("Message sur la console");
}