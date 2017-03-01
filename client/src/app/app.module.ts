import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppRoutingModule } from './app-routing.module';
import { MediaService } from './media/media.service';
import { AuthService } from './shared/auth/auth.service';
import { UserService } from './shared/user.service';
import { AuthGuard } from './shared/auth/auth.guard';

import { AppComponent } from './app.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { HeaderComponent } from './shared/header/header.component';
import { SidenavComponent } from './shared/sidenav/sidenav.component';
import { LoginComponent } from './shared/login/login.component';
import { FooterComponent } from './shared/footer/footer.component';
import { MediaComponent } from './media/media.component';
import { MedialistComponent } from './media/medialist/medialist.component';
import { MediacardComponent } from './media/mediacard/mediacard.component';
import { SearchComponent } from './shared/search/search.component';
import { ProfileComponent } from './profile/profile.component';
import { LoggerComponent } from './shared/logger/logger.component';
import { MediaTableComponent } from './media/media-table/media-table.component';
import { ModifyMediaComponent } from './profile/modify-media/modify-media.component';
import {IMDBService} from "./media/imdb.service";
import { ThumbContainerComponent } from './thumb/thumb-container/thumb-container.component';
import {XHRService} from "./lib/xhr.service";
import { MediaDetailsComponent } from './media/mediadetails/mediadetails.component';
import { SeasonListComponent } from './media/season-list/season-list.component';
import { SelectListComponent } from './lib/select-list/select-list.component';
import { MediaStatsComponent } from './media-stats/media-stats.component';
import { SimpleNotificationsModule } from 'angular2-notifications';

@NgModule({
    declarations: [
        AppComponent,
        DashboardComponent,
        HeaderComponent,
        SidenavComponent,
        LoginComponent,
        FooterComponent,
        MediaComponent,
        MedialistComponent,
        MediacardComponent,
        SearchComponent,
        ProfileComponent,
        LoggerComponent,
        MediaTableComponent,
        ModifyMediaComponent,
        ThumbContainerComponent,
        MediaDetailsComponent,
        SeasonListComponent,
        SelectListComponent,
        MediaStatsComponent
    ],
    imports: [
        BrowserModule,
        FormsModule,
        ReactiveFormsModule,
        HttpModule,
        AppRoutingModule,
        SimpleNotificationsModule.forRoot()
    ],
    providers: [
        AuthService,
        AuthGuard,
        MediaService,
        XHRService,
        UserService,
        IMDBService
    ],
    bootstrap: [ AppComponent ]
})
export class AppModule {
}
