console.log("Hello");

const navSlide = () => {
    const burger = document.querySelector('.burger');
    const nav = document.querySelector('nav ul');
    const navLinks = document.querySelectorAll('nav ul li');


    burger.addEventListener('click', () => {

        //Show and Hide Nav
        nav.classList.toggle('nav-active'); 

        //Nav Links Fade Animation
        navLinks.forEach((link, index) => {

            if(link.style.animation)
            {
                link.style.animation = '';
            }
            else
            {
                link.style.animation = `navLinksFade 0.5s ease forwards ${index / 7 + 0.5}s`;
            }
        });

        //Burger Animation
        burger.classList.toggle('clicked');
    });
};

navSlide();

$(document).ready(function(){

    $(".scroll a").on('click', function(event) {      
        $('html,body').animate({scrollTop: $("#body").offset().top}, 'fast');
    });

    $("button.contact").click(function() {
        $('html,body').animate({scrollTop: $("#contact").offset().top}, 'fast');
    });

    $(".hero").on( 'scroll', function(){
        $('html,body').animate({scrollTop: $("#body").offset().top}, 'fast');
    });
});