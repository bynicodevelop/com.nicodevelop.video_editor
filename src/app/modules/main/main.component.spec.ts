import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainComponent } from './main.component';

describe('MainComponent', () => {
  let component: MainComponent;
  let fixture: ComponentFixture<MainComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MainComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("Doit réinitialiser les propriété time et duration sur l'appel de la méthode onNewVideo", () => {
    component.time = 100;
    component.duration = 200;

    component.onNewVideo();

    expect(component.time).toBe(0);
    expect(component.duration).toBe(0);
  });
});
