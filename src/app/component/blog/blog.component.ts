import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-blog',
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.css'],
})
export class BlogComponent implements OnInit {
  dd = 'topright';

  constructor() { }

  ngOnInit(): void {
 
      this.play();

  }

  play(): any {
    let shkl1 = <HTMLInputElement>document.getElementById('shkl1');
    let rep1 = shkl1.classList.replace('shkl1', 'shkl12');
    let shkl2 = <HTMLInputElement>document.getElementById('shkl2');
    let rep2 = shkl2.classList.replace('shkl2', 'shkl22');
    let imageP = <HTMLInputElement>document.getElementById('imageP');
    let doc = <HTMLInputElement>document.getElementById('doc');
    imageP.style.marginTop = '0';
    setTimeout(() => {
      let rep1 = shkl1.classList.replace('shkl12', 'shkl1');
      let rep2 = shkl2.classList.replace('shkl22', 'shkl2');
      imageP.style.marginTop = '110%';
      setTimeout(() => {
        let rep1 = shkl1.classList.replace('shkl1', 'shkl13');
        doc.style.marginLeft = '-10px';
        setTimeout(() => {
          let rep1 = shkl1.classList.replace('shkl13', 'shkl1');
          doc.style.marginLeft = '100%';
          setTimeout(() => {
            this.play();
          }, 500);
        }, 3000);
      }, 500);
    }, 3000);
  }
}
