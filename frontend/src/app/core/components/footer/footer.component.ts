import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <footer class="xtrim-footer">
      © Xtrim 2025 - Xtrim y todos sus productos son marcas registradas.
    </footer>
  `,
  styles: []
})
export class FooterComponent {}