import { isPlatformBrowser } from '@angular/common';
import { Component, ElementRef, inject, PLATFORM_ID, ViewChild, OnInit, OnDestroy, HostListener } from '@angular/core';
import { HeroSection } from './shared/hero-section/hero-section';
import { ServicesSection } from "./shared/services-section/services-section";
import { IdeasSection } from './shared/ideas-section.component/ideas-section.component';
import { ProductsSection } from './shared/products-section.component/products-section.component';
import { ClientsSection } from './shared/clients-section.component/clients-section.component';
import { OrderFormSection } from "./shared/order-form-section.component/order-form-section.component";
import { ImageSliderComponent } from "./shared/image-slider.component/image-slider.component";
import { FooterSection } from "./shared/footer-section.component/footer-section.component";
import { TopbarComponent } from "./shared/topbar.component/topbar.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [HeroSection, ServicesSection, IdeasSection, ProductsSection, ClientsSection, OrderFormSection, ImageSliderComponent, FooterSection, TopbarComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit, OnDestroy {
  @ViewChild('bgCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  private platformId = inject(PLATFORM_ID);
  isBrowser = false;

  // Total de frames na mesma pasta
  private totalFrames = 70; 
  private images: HTMLImageElement[] = [];
  private animationFrameId: number | null = null;
  
  private frameAtualIndex = 0;
  private fps = 30; // Velocidade da animação (30 quadros por segundo)
  private ultimoTempo = 0;

  ngOnInit() {
    this.isBrowser = isPlatformBrowser(this.platformId);
    if (this.isBrowser) {
      this.preloadImagens();
    }
  }

  ngOnDestroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  private preloadImagens() {
    for (let i = 1; i <= this.totalFrames; i++) {
      const img = new Image();
      // Puxa tudo da mesma pasta: assets/frames/tinta1.png até tinta70.png
      img.src = `assets/frames/tinta${i}.png`; 
      img.decode?.().catch(() => {});
      this.images.push(img);
    }

    // Inicia o Canvas e a animação
    setTimeout(() => {
      this.ajustarTamanhoCanvas();
      this.iniciarAnimacao();
    }, 50);
  }

  private iniciarAnimacao() {
    const loop = (tempoAtual: number) => {
      if (!this.ultimoTempo) this.ultimoTempo = tempoAtual;
      
      const intervalo = 1000 / this.fps;
      const progressoTempo = tempoAtual - this.ultimoTempo;

      if (progressoTempo >= intervalo) {
        this.ultimoTempo = tempoAtual;
        
        // Desenha o frame atual
        this.renderFrame(this.frameAtualIndex + 1);
        
        // Avança para o próximo
        this.frameAtualIndex++;
      }

      // CRUCIAL: Só continua o loop se NÃO chegou ao fim das 70 imagens
      if (this.frameAtualIndex < this.totalFrames) {
        this.animationFrameId = requestAnimationFrame(loop);
      } else {
        // Chegou no frame 70? Trava aqui e encerra a execução do ciclo
        if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
      }
    };

    this.animationFrameId = requestAnimationFrame(loop);
  }

  private renderFrame(frameNumber: number) {
    if (!this.canvasRef) return;
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    const img = this.images[frameNumber - 1];

    if (!ctx || !img) return;

    const imgRatio = img.width / img.height;
    const canvasRatio = canvas.width / canvas.height;
    let drawWidth = canvas.width;
    let drawHeight = canvas.height;
    let drawX = 0;
    let drawY = 0;

    if (canvasRatio > imgRatio) {
      drawHeight = canvas.width / imgRatio;
      drawY = (canvas.height - drawHeight) / 2; 
    } else {
      drawWidth = canvas.height * imgRatio;
      drawX = (canvas.width - drawWidth) / 2; 
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
  }

  private ajustarTamanhoCanvas() {
    if (this.canvasRef) {
      this.canvasRef.nativeElement.width = window.innerWidth;
      this.canvasRef.nativeElement.height = window.innerHeight;
    }
  }

  @HostListener('window:resize', [])
  onResize() {
    if (this.isBrowser) {
      this.ajustarTamanhoCanvas();
      // Se a animação já terminou, garante que o último frame redesenhe no tamanho certo
      const frameParaRedesenhar = Math.min(this.frameAtualIndex, this.totalFrames);
      this.renderFrame(frameParaRedesenhar);
    }
  }
}