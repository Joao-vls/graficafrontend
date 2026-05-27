import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-topbar',
  standalone: true,
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.scss'
})

export class TopbarComponent {
  isHidden = false;
  private lastScrollTop = 0;

  // Escuta o movimento de scroll da janela do navegador
  @HostListener('window:scroll', [])
  onWindowScroll() {
    const currentScroll = window.pageYOffset || document.documentElement.scrollTop;

    // Se o usuário rolar bem próximo do topo (menos de 50px), força a exibição
    if (currentScroll <= 50) {
      this.isHidden = false;
      this.lastScrollTop = currentScroll;
      return;
    }

    if (currentScroll > this.lastScrollTop) {
      // Usuário está descendo a página -> Esconde a barra
      this.isHidden = true;
    } else {
      // Usuário está subindo a página -> Mostra a barra rapidamente
      this.isHidden = false;
    }

    // Atualiza a última posição para o próximo cálculo
    this.lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
  }
}