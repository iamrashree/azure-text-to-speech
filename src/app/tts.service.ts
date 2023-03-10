import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TtsService {

  constructor(private http: HttpClient) { }

  public getVoices(): Observable<any> {
    return this.http.get('/assets/voices.json');
  }
}
