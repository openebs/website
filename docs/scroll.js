window.addEventListener('hashchange', function(e){
    const elementId = e.newURL.split('#')[1];
    const element = document.getElementById(elementId);
    const header = document.getElementById('header');
    element.style.top = '-78px';
    element.scrollIntoView({
        top: element.offsetTop,
        behavior: 'smooth'
    })
})