import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { environment } from 'src/environments/environment.development';

import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { VideoEffects } from './store/video/video.effects';
import * as fromVideo from './store/video/video.reducer';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    StoreModule.forRoot(
      {
        [fromVideo.videoFeatureKey]: fromVideo.videoReducer,
      },
      {
        metaReducers: fromVideo.videoMetaReducers,
        runtimeChecks: {
          strictActionTypeUniqueness: true,
          strictActionImmutability: true,
          strictStateImmutability: true,
        },
      }
    ),
    StoreDevtoolsModule.instrument({
      name: 'Ngrx Starter Kit Coulisses Learn',
      maxAge: 25,
      logOnly: environment.production,
    }),
    StoreModule.forFeature(fromVideo.videoFeatureKey, fromVideo.videoReducer, {
      metaReducers: fromVideo.videoMetaReducers,
    }),
    EffectsModule.forRoot([VideoEffects]),
    EffectsModule.forFeature([VideoEffects]),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
