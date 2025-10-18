
function search() {
    let input = document.getElementById('searchbar').value.toLowerCase();
    let componentContainers = document.querySelectorAll('#components-container > div');

    componentContainers.forEach(container => {
        let componentName = container.querySelector('h2').textContent.toLowerCase();
        if (componentName.includes(input)) {
            container.style.display = "";
        } else {
            container.style.display = "none";
        }
    });
}


