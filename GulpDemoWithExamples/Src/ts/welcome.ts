class Welcome {
    constructor(public greeting: string) { }
    greet() {
        return this.greeting + " Experience the power of Gulp!";
    }
}

var welcome = new Welcome("Hello, Developers!");

var fieldNameElement = document.getElementById('welcomeHeading');
fieldNameElement.innerHTML = welcome.greet();
