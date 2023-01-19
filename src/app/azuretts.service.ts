import { Injectable } from '@angular/core';
import * as AzureTTSSdk from 'microsoft-cognitiveservices-speech-sdk';
import { SpeechSynthesisOutputFormat } from 'microsoft-cognitiveservices-speech-sdk';

import { Buffer } from 'buffer';
import { appConfig } from 'src/environments/appConfig';

@Injectable({
  providedIn: 'root'
})
export class AzurettsService {

  private speechConfig!: AzureTTSSdk.SpeechConfig;
  private speechSynthesizer!: AzureTTSSdk.SpeechSynthesizer;

  constructor() { }

  public async init() {
    this.speechConfig = AzureTTSSdk.SpeechConfig.fromSubscription(appConfig.key, appConfig.region);
    this.speechConfig.speechSynthesisOutputFormat = SpeechSynthesisOutputFormat.Riff24Khz16BitMonoPcm; // Set the output format
    this.speechSynthesizer = new AzureTTSSdk.SpeechSynthesizer(this.speechConfig, null as unknown as AzureTTSSdk.AudioConfig);
  }

  public async startSpeechSynthesis(ssmlSegments: string) {
    return new Promise((resolve, reject) => {
        this.speechSynthesizer.speakSsmlAsync(ssmlSegments, async (result) => { // "Getting the response as an in-memory stream.",\
            if (result.audioData) {
                const audioData = Buffer.from(result.audioData);
                resolve(audioData);
            }
            else {
                reject('Tier 1 ' + result.errorDetails);
            }
        }, async (error) => {
            await this.closeSpeechSynthesis();
            reject('Tier 1 ' + error);
        });
    });
  }

     /* Once speech synthesis completes for all projects ,let's close the synthesizer. */
     public async closeSpeechSynthesis() {
      if (this.speechSynthesizer) {
          this.speechSynthesizer.close();
      }
  }
}
