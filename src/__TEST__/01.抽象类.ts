abstract class Abstract {
  name: string;
  age: number;
  constructor(name: string, age: number) {
    this.name = name;
    this.age = age;
  }
  say() {
    console.log(this.name + " say hello");
  }
}

class Child extends Abstract {
  constructor(name: string, age: number) {
    super(name, age);
  }
}

let child = new Child("child", 18);
console.log(child);
child.say();
