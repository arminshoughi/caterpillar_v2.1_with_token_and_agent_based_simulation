import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { Http } from "@angular/http";
import * as Modeler from "bpmn-js/lib/Modeler.js";
import * as propertiesPanelModule from "bpmn-js-properties-panel";
import * as propertiesProviderModule from "bpmn-js-properties-panel/lib/provider/bpmn";
import { ProcessStorage } from "app/data-store/data-store";
import tockensimulation from 'bpmn-js-token-simulation';
import { PaletteProvider } from "./palette";
import { CustomPropertiesProvider } from "./props-provider";
import { HttpClient } from "@angular/common/http";


const fs = require("fs");
const async = require("async");

const customPaletteModule = {
  paletteProvider: ["type", PaletteProvider]
};

const customPropertiesProviderModule = {
  __init__: ["propertiesProvider"],
  propertiesProvider: ["type", CustomPropertiesProvider]
};

@Component({
  selector: "modeler",
  styleUrls: ["./modeler.component.css"],
  templateUrl: "./modeler.component.html"
})
export class ModelerComponent implements OnInit {
  modeler: any;

  modelText: string;

  constructor(private router: Router, private processStorage: ProcessStorage, private http: HttpClient) { }

  ngOnInit() {
    this.processStorage.resetModel();
    console.log(tockensimulation)
    this.modeler = new Modeler({
      container: '#canvas',
      additionalModules: [
        propertiesPanelModule,
        propertiesProviderModule,
        customPropertiesProviderModule,
        customPaletteModule,
        tockensimulation
      ],
      propertiesPanel: {
        parent: '#js-properties-panel'
      }
    });
    this.modeler.importXML(
      this.processStorage.model,
      (error, definitions) => { }
    );
  }

  openFile(event) {
    const input = event.target;
    for (let index = 0; index < input.files.length; index++) {
      const reader = new FileReader();
      reader.onload = () => {
        this.processStorage.model = reader.result;
        this.modeler.importXML(
          this.processStorage.model,
          (error, definitions) => { }
        );
      };
      reader.readAsText(input.files[index]);
    }
  }

  validateName() {
    this.modeler.saveXML({ format: true }, (err: any, xml: string) => {
      for (let i = 0; i < this.modeler.definitions.rootElements.length; i++) {
        if (this.modeler.definitions.rootElements[i].$type === 'bpmn:Process') {
          if (this.processStorage.hasModel(this.modeler.definitions.rootElements[i].id)) {
            this.modelText =
              'The selected ID exists on the Workspace. Please, change this value and try again.';
          }
          else if (!this.modeler.definitions.rootElements[i].name || this.modeler.definitions.rootElements[i].name === '') {
            this.modelText =
              'The Name of the model cannot be empty. Please, update this value and try again.';
          }
          else {
            // this.goToDashborad();
            this.processStorage.modelId = this.modeler.definitions.rootElements[i].id;
            this.processStorage.registerModel(xml);
            this.modelText =
              'Working in Model Registration. Please, take into account that this may require some seconds.';
          }
          break;
        }
      }
    });
  }

  goToDashborad() {
    this.router.navigateByUrl('/dashboard');
  }
  agentBaseSimulation() {
    this.modeler.saveXML({ format: true }, async (err: any, xml: string) => {
      // console.log(xml)
      // var file = require('file-saver')
      // var blob = new Blob([xml], {type: "text/plain;charset=utf-8"});
      // alert("For simulate bpmn and see the result, first when download dialog is shown download bpmn file, then you will be redirected to simulation tab and when simulatio tab was loaded successfuly, upload this file and click on 'Continue' button to starting simulate BPMN.")
      // file.saveAs(blob, "test.bpmn"); 

      // setCookie('xml',xml.split('\n').join('\\'));      
      // window.open("http://127.0.0.1:8080",'_blank');

      // const getClient = require("mongodb-atlas-api-client");
      // const {user, cluster} = getClient({
      //   "publicKey": "xnkiorwy",
      //   "privateKey": "c9cd526b-15f6-4422-ab3a-475bf12057da",
      //   "baseUrl": "https://cloud.mongodb.com/api/atlas/v1.0",
      //   "projectId": 1
      // });

      // const options = {
      //   "envelope": true,
      //   "itemsPerPage": 10,
      //   "pretty": true
      // }

      // const response = await user.getAll(options); // get All users
      // const response = await cluster.get(" BPMNStorage"); // get single cluster
      // const response = await user.delete("someUserName", options); // delete single user
      // const response = await user.create(body, options); // create user
      // const response = await user.update("someUserName", body, options);
      document.getElementById('loading').style.display='block';
      this.http.post<any>('https://webhooks.mongodb-realm.com/api/client/v2.0/app/bpmn-simulation-sukdy/service/manage-BPMNs/incoming_webhook/save-bpmn', { "bpmn": btoa(xml) }).subscribe(data => {
        console.log(data.result);
        document.getElementById('loading').style.display='none';
        window.open("http://127.0.0.1:8080",'_blank');
      })

    })

    function setCookie(cname, cvalue) {
      var d = new Date();
      d.setTime(d.getTime() + (10000));
      var expires = "expires=" + d.toUTCString();
      document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/; flavor=choco; SameSite=Lax";
    }

    function getCookie(cname) {
      var name = cname + "=";
      var decodedCookie = decodeURIComponent(document.cookie);
      var ca = decodedCookie.split(';');
      for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
          c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
          return c.substring(name.length, c.length);
        }
      }
      return "";
    }

    // this.modeler.saveXML({ format: true }, (err: any, xml: string) => {
    //   for (let i = 0; i < this.modeler.definitions.rootElements.length; i++) 
    //   {
    //     if (this.modeler.definitions.rootElements[i].$type === 'bpmn:Process') 
    //     {
    //       if (this.processStorage.hasModel(this.modeler.definitions.rootElements[i].id)) 
    //       {
    //         this.modelText =
    //           'The selected ID exists on the Workspace. Please, change this value and try again.';
    //       } 
    //       else if (!this.modeler.definitions.rootElements[i].name || this.modeler.definitions.rootElements[i].name === '') {
    //         this.modelText =
    //           'The Name of the model cannot be empty. Please, update this value and try again.';
    //       } 
    //       else {
    //         // this.goToDashborad();
    //         this.processStorage.modelId = this.modeler.definitions.rootElements[i].id;
    //         this.processStorage.getRegisterModel(xml);
    //         this.modelText =
    //           'Working in Model Registration. Please, take into account that this may require some seconds.';
    //       }
    //       break;
    //     }
    //   }

    // })

  }
}
