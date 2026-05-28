import {
  Component,
  ElementRef,
  ViewChild,
  OnInit,
  OnDestroy,
  AfterViewInit,
  HostListener,
  inject,
  PLATFORM_ID
} from '@angular/core';

import { isPlatformBrowser } from '@angular/common';

interface ProductItem {
  image: string;
  name: string;
  brand: string;
  badge: string;
}

@Component({
  selector: 'app-products-section',
  standalone: true,
  templateUrl: './products-section.component.html',
  styleUrl: './products-section.component.scss'
})
export class ProductsSection
implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('productsCanvas', { static: true })
  canvasRef!: ElementRef<HTMLCanvasElement>;

  @ViewChild('track', { static: true })
  trackRef!: ElementRef<HTMLDivElement>;

  // =========================================
  // PLATFORM
  // =========================================

  private platformId = inject(PLATFORM_ID);

  private isBrowser = false;

  // =========================================
  // PRODUTOS
  // =========================================

  products: ProductItem[] = [
    {
      image: 'assets/produtos/carimbomadeira.jpg',
      name: 'CARIMBO',
      brand: 'MARCA',
      badge: '4 CORES'
    },
    {
      image: 'assets/produtos/carimboautomatico.jpg',
      name: 'CARIMBO',
      brand: 'MARCA',
      badge: '4 CORES'
    },
    {
      image: 'assets/produtos/resma.jpg',
      name: 'RESMA',
      brand: 'MARCA',
      badge: '4 TAMANHOS'
    },
    {
      image: 'assets/produtos/caderno.jpg',
      name: 'CADERNO',
      brand: 'MARCA',
      badge: '2 MODELOS'
    }
  ];

  displayProducts: ProductItem[] = [];

  private readonly clonesCount = 4;

  private isJumping = false;

  // =========================================
  // CANVAS
  // =========================================

  private observer: IntersectionObserver | null = null;

  private readonly startFrame = 59;

  private readonly endFrame = 71;

  private images: HTMLImageElement[] = [];

  private currentFrameIndex = 0;

  private animationId: number | null = null;

  private fps = 30;

  private lastTime = 0;

  constructor() {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  // =========================================
  // INIT
  // =========================================

  ngOnInit(): void {

    if (!this.isBrowser) return;

    this.prepareInfiniteList();

    this.configurarGatilho();
  }

  ngAfterViewInit(): void {

    setTimeout(() => {

      this.setInitialScroll();

    }, 100);
  }

  ngOnDestroy(): void {

    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }

    if (this.observer) {
      this.observer.disconnect();
    }
  }

  // =========================================
  // RESPONSIVO
  // =========================================

  @HostListener('window:resize')
  onResize() {

    this.resizeCanvas();
  }

  // =========================================
  // INFINITE CAROUSEL
  // =========================================

  private prepareInfiniteList() {

    if (this.products.length < 2) {

      this.displayProducts = this.products;

      return;
    }

    const startClones =
      this.products.slice(-this.clonesCount);

    const endClones =
      this.products.slice(0, this.clonesCount);

    this.displayProducts = [
      ...startClones,
      ...this.products,
      ...endClones
    ];
  }

  private setInitialScroll() {

    const track = this.trackRef.nativeElement;

    const cardWidth =
      this.getCardWidth(track);

    track.style.scrollBehavior = 'auto';

    track.scrollLeft =
      cardWidth * this.clonesCount;

    track.style.scrollBehavior = 'smooth';
  }

  onScroll(): void {

    const track = this.trackRef.nativeElement;

    const cardWidth =
      this.getCardWidth(track);

    const totalItems =
      this.displayProducts.length;

    if (!this.isJumping) {

      // LOOP DIREITA
      if (
        track.scrollLeft >=
        cardWidth * (totalItems - this.clonesCount)
      ) {

        this.jumpScroll(
          cardWidth * this.clonesCount
        );
      }

      // LOOP ESQUERDA
      else if (track.scrollLeft <= 0) {

        this.jumpScroll(
          cardWidth *
          (totalItems - (this.clonesCount * 2))
        );
      }
    }
  }

  private jumpScroll(position: number) {

    const track = this.trackRef.nativeElement;

    this.isJumping = true;

    track.style.scrollBehavior = 'auto';

    track.scrollLeft = position;

    setTimeout(() => {

      track.style.scrollBehavior = 'smooth';

      this.isJumping = false;

    }, 50);
  }

  // =========================================
  // BOTÕES
  // =========================================

  scrollNext(): void {

    const track = this.trackRef.nativeElement;

    track.scrollBy({
      left: this.getCardWidth(track),
      behavior: 'smooth'
    });
  }

  scrollPrev(): void {

    const track = this.trackRef.nativeElement;

    track.scrollBy({
      left: -this.getCardWidth(track),
      behavior: 'smooth'
    });
  }

private getCardWidth(track: HTMLDivElement): number {

  const card =
    track.querySelector('.product-card');

  if (card instanceof HTMLElement) {
    return card.offsetWidth + 22;
  }

  return 340;
}

  // =========================================
  // INTERSECTION OBSERVER
  // =========================================

  private configurarGatilho() {

    const opcoes = {
      root: null,
      threshold: 0.2
    };

    this.observer = new IntersectionObserver((entries) => {

      entries.forEach(entry => {

        if (entry.isIntersecting) {

          this.preloadImages();

          if (this.observer) {
            this.observer.disconnect();
          }
        }
      });

    }, opcoes);

    const elementoHtml =
      this.canvasRef.nativeElement.parentElement;

    if (elementoHtml) {
      this.observer.observe(elementoHtml);
    }
  }

  // =========================================
  // PRELOAD
  // =========================================

  private preloadImages() {

    const totalFramesToLoad =
      this.endFrame - this.startFrame + 1;

    let loadedCount = 0;

    for (
      let i = this.startFrame;
      i <= this.endFrame;
      i++
    ) {

      const img = new Image();

      img.src = `assets/frames/tinta${i}.png`;

      img.onload = () => {

        loadedCount++;

        if (loadedCount === totalFramesToLoad) {

          this.resizeCanvas();

          this.startAnimation();
        }
      };

      this.images.push(img);
    }
  }

  // =========================================
  // ANIMAÇÃO
  // =========================================

  private startAnimation() {

    const animate = (currentTime: number) => {

      if (!this.lastTime) {
        this.lastTime = currentTime;
      }

      const delta = currentTime - this.lastTime;

      const interval = 1000 / this.fps;

      if (delta >= interval) {

        this.lastTime = currentTime;

        this.render();

        this.currentFrameIndex++;
      }

      if (this.currentFrameIndex < this.images.length) {

        this.animationId =
          requestAnimationFrame(animate);
      }
    };

    this.animationId =
      requestAnimationFrame(animate);
  }

  // =========================================
  // RENDER
  // =========================================

  private render() {

    const canvas = this.canvasRef.nativeElement;

    const ctx = canvas.getContext('2d');

    const img =
      this.images[this.currentFrameIndex];

    if (!ctx || !img) return;

    ctx.clearRect(
      0,
      0,
      canvas.width,
      canvas.height
    );

    const imgRatio = img.width / img.height;

    const canvasRatio =
      canvas.width / canvas.height;

    let dWidth: number;

    let dHeight: number;

    let dX: number;

    let dY: number;

    if (canvasRatio > imgRatio) {

      dWidth = canvas.width;

      dHeight = canvas.width / imgRatio;

      dX = 0;

      dY = (canvas.height - dHeight) / 2;

    } else {

      dWidth = canvas.height * imgRatio;

      dHeight = canvas.height;

      dX = (canvas.width - dWidth) / 2;

      dY = 0;
    }

    ctx.drawImage(
      img,
      dX,
      dY,
      dWidth,
      dHeight
    );
  }

  // =========================================
  // RESIZE
  // =========================================

  private resizeCanvas() {

    if (!this.canvasRef) return;

    const canvas = this.canvasRef.nativeElement;

    canvas.width = canvas.offsetWidth;

    canvas.height = canvas.offsetHeight;
  }
}