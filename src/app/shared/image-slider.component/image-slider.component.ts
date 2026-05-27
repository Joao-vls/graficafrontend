import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

interface SlideItem {
  image: string;
  alt?: string;
}

@Component({
  selector: 'app-image-slider',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './image-slider.component.html',
  styleUrl: './image-slider.component.scss'
})
export class ImageSliderComponent {
  // Recebe a lista de imagens dinamicamente de onde o componente for chamado
  @Input() slides: SlideItem[] = [
    { image: 'assets/portfolio/fachada1.jpg', alt: 'Wine & Liquor Mart' },
    { image: 'assets/portfolio/fachada2.jpg', alt: 'Letras Caixa Wood' },
    { image: 'assets/portfolio/fachada3.jpg', alt: 'Letreiro Luminoso Wine' }
  ];

  currentIndex = 0;

  nextSlide(): void {
    if (this.currentIndex < this.slides.length - 1) {
      this.currentIndex++;
    } else {
      this.currentIndex = 0; // Volta para o primeiro se chegar ao fim
    }
  }

  prevSlide(): void {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    } else {
      this.currentIndex = this.slides.length - 1; // Vai para o último se voltar do início
    }
  }

  goToSlide(index: number): void {
    this.currentIndex = index;
  }
}