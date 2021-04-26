import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { TopBarComponent } from './top-bar/top-bar.component';
import { ProductListComponent } from './samples/product-list/product-list.component';
import { ProductAlertsComponent } from './samples/product-alerts/product-alerts.component';
import { ProductDetailsComponent } from './samples/product-details/product-details.component';
import { AuthenticationComponent } from './authentication/authentication.component';
import { QuoteFeedComponent } from './quote-feed/quote-feed.component';

import firebase from 'firebase/app';
import { config } from './config';
firebase.initializeApp(config);

@NgModule({
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    RouterModule.forRoot([
      { path: '', component: AuthenticationComponent },
      { path: 'feed', component: QuoteFeedComponent },
      { path: 'products', component: ProductListComponent },
      { path: 'products/:productId', component: ProductDetailsComponent },
    ])
  ],
  declarations: [
    AppComponent,
    TopBarComponent,
    ProductListComponent,
    ProductAlertsComponent,
    ProductDetailsComponent,
    AuthenticationComponent,
    QuoteFeedComponent
  ],
  bootstrap: [
    AppComponent
  ]
})
export class AppModule { }
