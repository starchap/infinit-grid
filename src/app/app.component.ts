import { Component } from '@angular/core';

type Header = {
  id: string;
  name: string;
}
type AwesomeObjectAttribute = {
  id: string;
  value: string;
}

type AwesomeObject = {
  id: string;
  name: string;
  attributes?: Record<string, AwesomeObjectAttribute>
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'table';

  headers: Header[] = [];
  headerRange: Header[] = [];
  products: AwesomeObject[] = [];

  constructor() {
    this.makeHeaders(100, 10, 1.5);
    this.makeProducts(500, 400, 10, 1.5)
  }

  setHeaderRange(range: Header[]):void{
    this.headerRange = range;
  }

  getProductAttribute(awesomeObject:AwesomeObject, header: Header):string{
    switch (header.id) {
      case "123":
        return awesomeObject.name;
      default:
        return awesomeObject.attributes[header.id].value
    }
  }

  private makeHeaders(numberOfAttributes: number, idLength:number = 10, factor: number = 1 ):void{
    for(let i: number = 0;  i < numberOfAttributes; i++){
      this.headers.push({id: this.makeId(idLength), name:'H:'+this.makeId(idLength, factor)});
    }
    this.headers = [{id: '123', name: 'Product Name'}, ...this.headers]
  }

  private makeProducts(numberOfAttributes: number, numberOfProducts: number, idLength:number = 10, factor: number = 1 ):void{
    for(let i: number = 0;  i < numberOfProducts; i++){
      let product: AwesomeObject = {id:this.makeId(idLength, factor), name:'P:'+this.makeId(idLength, factor), attributes: {}};
      this.headers.forEach((header) => {
        product.attributes[header.id] = {id:this.makeId(idLength, factor), value: 'A:'+this.makeId(idLength, factor)};

      })
      this.products.push(product)
    }
  }

  private makeId(length:number, factor:number = 1) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length*factor; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }
}
