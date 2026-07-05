import { Component, input } from '@angular/core';

@Component({
  selector: 'app-book-details',
  template: `
    <section class="page">
      <h1>Detalji knjige</h1>
      <p>ID knjige: {{ id() }}</p>
      <p>Stranica stiže u Phase 4.</p>
    </section>
  `,
})
export class BookDetailsPage {
  readonly id = input.required<string>();
}
