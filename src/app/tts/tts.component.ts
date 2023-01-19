import { AzurettsService } from './../azuretts.service';
import { Component, OnInit } from '@angular/core';
import { TtsService } from '../tts.service';
import * as xmlbuilder from 'xmlbuilder';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-tts',
  templateUrl: './tts.component.html',
  styleUrls: ['./tts.component.scss']
})
export class TtsComponent implements OnInit {

  public voices: any[] =[];
  public error: any;
  public ttsFormGroup!: FormGroup;
  public blobURL!: SafeResourceUrl;
  public spinner = false;
  constructor(private ttsService: TtsService,
    private azureTtsService: AzurettsService, 
    private formBuilder: FormBuilder,
    private sanitizer: DomSanitizer) { }

  ngOnInit(): void {
    this.getVoices();

    this.ttsFormGroup = this.formBuilder?.group({
        segmentData: ['', Validators.required],
        speedRate: [1, Validators.required],
        voice: ['', Validators.required],
      });
  }

  getVoices() {
    this.ttsService.getVoices().subscribe(data => {
      this.voices = data.voices.filter((voice: any) => voice.Status !== 'Preview');
    });
  }

  ssmlSegment() {
      const voice = this.ttsFormGroup?.get('voice')?.value;
      const xml_body = xmlbuilder
            .create('speak').att('version', '1.0').att('xmlns', 'http://www.w3.org/2001/10/synthesis').att('xmlns:mstts', 'http://www.w3.org/2001/mstts').att('xml:lang', voice.Locale)
            .ele('voice').att('name', voice.ShortName)
            // .ele('lexicon').att('uri', this.projectDto.lexiconUri).up()
            // .ele('mstts:express-as').att('style', voiceStyle)
            .ele('prosody').att('rate', this.ttsFormGroup?.get('speedRate')?.value).att('pitch', '0%')
            .txt(this.ttsFormGroup.get('segmentData')?.value || '')
            .end();
    return xml_body;
  }

  converToSpeech() {
    this.error = '';
    this.spinner = true;
    const ssmlSegment = this.ssmlSegment();
    this.azureTtsService.init();
    this.azureTtsService.startSpeechSynthesis(ssmlSegment).then((data)=> {
      if(data) {
        const blob = new Blob([data as Buffer], { type: 'application/octet-stream' });
        this.blobURL= this.sanitizer.bypassSecurityTrustResourceUrl(window.URL.createObjectURL(blob));
        this.spinner = false;
        this.azureTtsService.closeSpeechSynthesis();
      }
    }).catch((error) => {
      console.log('error', error)
      this.error = error;
    });
  }
}
