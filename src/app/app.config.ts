import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import player from 'lottie-web'; // ✅ import player من lottie-web

import { routes } from './app.routes';
import { provideCacheableAnimationLoader, provideLottieOptions } from 'ngx-lottie';

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes),
    provideLottieOptions({ player: () => player })
  ],
};
