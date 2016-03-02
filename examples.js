(function(){
  // Classes:

  // You can create a class by passing an object to the classr function. The constructor method will
  // is not mandatory. If you don't supply one, a default constructor will be created for you.

  console.warn('=== Classes:');

  var Animal = classr({
    constructor: function Animal(name) {
      this.name = name;
    },
    sayName: function() {
      console.log(this.name);
    }
  });

  // The classr function will return a constructor. You can create an instance of a class with the
  // new keyword, as expected:

  var dog = new Animal('Dobby');
  dog.sayName(); // "Dobby"

  // Inheritance:

  console.warn('=== Inheritance:');

  // You can create child classes by passing the parent class as the first parameter of the classr
  // function. this.superFor will be automatically added to the prototype of your class and will
  // receive as parameters the current class, the method name, and an array of parameters. It's not
  // the nicest looking super implementation ever, but it's simple, safe, and works.

  var Feline = classr(Animal, {
    constructor: function Feline(name) {
      this.superFor(Feline, 'constructor', [name]);
    },
    sayMeaow: function() {
      console.log('meaoow!');
    }
  });

  var pinkPanther = new Feline('Pink Panther');
  pinkPanther.sayName(); // "Pink Panther"
  pinkPanther.sayMeaow(); // "meaoow!"

  // Multiple levels of inheritance are possible:

  console.warn('=== Multiple level inheritance:');

  var Cat = classr(Feline, {
    constructor: function Cat(name) {
      this.superFor(Cat, 'constructor', [name]);
    },
    eatLasagna: function() {
      console.log('I love lasagna');
      this.sayMeaow();
    }
  });

  var garfield = new Cat('Garfield');
  garfield.sayName(); // "Garfield"
  garfield.eatLasagna(); // "I love lasagna \ meaoow!""

  // Named classes:

  // One weird/cool thing about classr is that you can use it as an isolated namespace by naming classes. To create a
  // named class, add a string as the first parameter of the classr function.

  console.warn('=== Named classes:');

  classr('Rectangle', {
    constructor: function Rectangle(w, h) {
      this.width = w;
      this.height = h;
    },
    printArea: function() {
      console.log(this.width * this.height);
    }
  });

  // Sending a single string parameter to the classr function will return the constructor for the corresponding class:

  var rectA = new (classr('Rectangle')) (3, 4);
  rectA.printArea(); // 12

  // But since that way of instantiating classes looks so damn weird, you can do it like this as well:

  var rectB = classr('Rectangle').newInstance(5, 6);
  rectB.printArea(); // 30

  // You can do inheritance for named classes like this:

  console.warn('=== Named classes inheritance:');

  classr('Square extends Rectangle', {
    constructor: function Square(w) {
      this.superFor('Square.constructor', [w, w]);
    },
    printArea: function() {
      console.log("I'm about to print the area of a square:");
      this.superFor('Square.printArea');
    }
  });

  // "Square extends Rectangle", "Square < Rectangle" and "Square : Rectangle" all work.

  // Also, if the class is named, you should send a single string parameter containing "ClassName.method" to superFor
  // This: this.superFor("Square", "constructor", [w, w]) won't work.

  var sq = classr('Square').newInstance(3);
  sq.printArea(); // "I'm about to print the area of a square: \ 9"

  // Class "shared" attributes:

  // You can take advantage of js scoping to share attributes between all instances of a class. Instead of sending an object
  // to classr, send an IIFE returning that object. All the variables and methods defined outside the returned object will
  // be "shared" between instances. Why would you do such a thing, I don't know. But you can.

  console.warn('=== Classes with shared attributes:');

  classr('WeirdClass', (function(){
    var shared = 'original';
    return {
      // constructor is optional so we are skipping it this time.
      setShared: function(val) {
        shared = val;
      },
      printShared: function(){
        console.log(shared);
      }
    }
  })());

  var s1 = classr('WeirdClass').newInstance();
  var s2 = classr('WeirdClass').newInstance();

  s1.printShared(); // "original"
  s2.printShared(); // "original"

  s1.setShared('changed'); // changing the shared value from s1 will change it in all other instances.

  s1.printShared(); // "changed"
  s2.printShared(); // "changed"

  // Modules:

  // classr also allows you to manage modules. Instead of sending an object to the classr function, send
  // a function that returns an object. classr will return a singleton for your module.

  console.warn('=== Modules:');

  var modA = classr(function(){
    // everything defined here is private:
    var internal;
    function setInternal(val) {
      internal = val;
    }
    function showInternal() {
      console.log(internal);
    }
    return {
      setInternal: setInternal,
      showInternal: showInternal
    }
  });

  modA.setInternal('testing!');
  modA.showInternal(); // "testing!"

  // If you wish to pass parameters to the module creator function, you can send an array before the function,
  // like this.

  console.warn('=== Modules with initialization parameters:');

  var modB = classr([6, 7], function(a, b){
    var lue = a * b;
    function showTheAnswerToLue() {
      console.log(lue);
    }
    function changeLue(val) {
      lue = val;
    }
    return {
      showTheAnswerToLue: showTheAnswerToLue,
      changeLue: changeLue,
    }
  });

  modB.showTheAnswerToLue(); // "42"

  // But that's stupid!, you say. I can simply do an IIFE for that. Well, of course you can.
  // But with classr, you can do module inheritance as well.

  // Module inheritance?

  // Yep. Send the parent module as the first parameter and you will create a child module.

  console.warn('=== Module inheritance:');

  var modC = classr(modB, function(){
    function talkAboutThings() {
      console.log("Things are boring. So here's the answer to life, universe and everything: ");
      this.showTheAnswerToLue();
    }
    return {
      talkAboutThings: talkAboutThings,
    }
  });

  modC.talkAboutThings(); // "I'm dancing here. btw, this is the answer to LUE: \ 42"

  // Every module singleton has it's own scope, so if you change the lue value for modB, the lue value
  // for modC will remain the same:

  modB.changeLue(67);
  modB.showTheAnswerToLue(); // 67
  modC.showTheAnswerToLue(); // 42

  // Named modules:

  // You can create named modules exactly the same as you create named classes:

  console.warn('=== Named modules:');

  classr('modD', ['get down tonight'], function(init){
    var words = init;
    return {
      sing: function() {
        console.log(words);
      }
    }
  });

  // sending a single string parameter to classr will return the object singleton for the case of modules.

  classr('modD').sing(); // "get down tonight"

  // Inheritance works as you would expect.

  console.warn('=== Named modules inheritance:');

  classr('modE extends modD', ['make a little love'], function(init){
    var words = init;
    return {
      sing: function() {
        console.log(words);
        this.superFor('modE.sing');
      }
    }
  });

  classr('modF extends modE', ['do a little dance'], function(init){
    var words = init;
    return {
      sing: function() {
        console.log(words);
        this.superFor('modF.sing');
      }
    }
  });

  classr('modF').sing(); // "do a little dance \ make a little love \ get down tonight"
})();
