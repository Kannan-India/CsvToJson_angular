import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { DataModal } from './dataModal';
import { DateFormatter } from './date-formatter';
import { IStateLine } from './StateLine';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  singleLine: IStateLine = {
    id: null,
    state: "",
    city: "",
    tier: ""
  }

  constructor(private http: HttpClient){
  }

  onAdd(){
    if(this.singleLine.city != "" && this.singleLine.state !="" && this.singleLine.tier!=""){
      this.http.post("http://localhost:8080", this.singleLine).toPromise()
      .then(
        (data: IStateLine)=>{
          console.log(data);
          if(data.id == null){
            alert("Class updated successfully");
            // alert("Upload failed - Duplicate Entry\nCity : "+
            // data.city+" already exists under the State : " + data.state);
          }else{
            alert("Uploaded Successfully")
          }
        }
      )
    }
  }

  convertFile(){
    let input = (<HTMLInputElement>document.getElementById('csvFile')).files[0];
    let reader = new FileReader();

    reader.onload = () =>{
      let text = reader.result;
      // console.log('CSV: ', text + '...');
      this.csvJson(text);
    };
    reader.readAsText(input);
  }

  csvJson(csvText){
    //learn regex
    let lines=csvText.split(/\r\n|\n/);
    let stateLines:IStateLine[] = [];

    let headers: string[] = lines[0].split(",");

    console.log(lines.length)

    let flag=true;
    for(let i=1; i<lines.length; i++){

      let currentline: string[] = lines[i].split(",");

      //check if curretLine has only 3 elements
      if(currentline.length === 3  && currentline[0] != "" && currentline[1] != "" && currentline[2] != ""){
        let line: IStateLine = {
          id: null,
          state: currentline[0],
          city: currentline[1],
          tier: currentline[2]
        }

        //check for duplicates (lowercase not done)
        for(let j=0; j<stateLines.length; j++){
          if(stateLines[j].city.toLowerCase() == line.city.toLowerCase()){
            if(stateLines[j].state.toLowerCase() == line.state.toLowerCase() ){
              flag = false;
              alert("duplicate city found!\nLine No: " + i + " (" + line.state + ", " + line.city +
              ")\nAlready Exists on\n" +
               "Line No: " + j + " (" + stateLines[j].state + ", " + stateLines[j].city + ")");
              break;
            }
          }
        }

        if(flag){
          stateLines.push(line);
        }else{
          break;
        }
      }else{
        //to avoid error checking on last line
        if(i < (lines.length-1)){
          if(currentline[0] != "" || currentline[1] != "" || currentline[2] != ""){
            flag = false;
            alert("Upload Failed.\nReason: Empty cell found in the row: " + (i+1));
            break;
          }else{
            flag = false;
            alert("Upload Failed.\nReason: Illegal character - Comma(,) has been used in the row: " + (i+1))
            break;
          }
        }
      }
    }

    if(flag){
      // console.log(stateLines)
      // update db
      this.http.post("http://localhost:8080/cities", stateLines).toPromise()
      .then(
        (data)=>{
          alert("Uploaded Successfully\nNote: In case of any duplicate entries, they would ve been updated");
          // alert("Uploaded Successfully\nNote: In case of any duplicate entries, they would ve been rejected");
          console.log(data);
        }
      )
    }
  }

  deleteAll(){
    this.http.delete("http://localhost:8080").toPromise()
    .then(
      data => console.log(data)
    )
    alert("deleted Successfully")
  }


  data: DataModal[] = [
    new DataModal("Kannan S, kan", "21"),
    new DataModal(null, "18"),
  ]

  escapeToken: string = "~~~"

  csvdownload(){

    //escape commas in data
    this.escapeCommas()

    //getting all the object's values as arrays
    let csv = this.data.map(row => Object.values(row));

    //inserting headings
    csv.unshift(Object.keys(this.data[0]));

    //updating csv with quotes and commas
    let csvString = this.unescapeCommas(`"${csv.join('"\n"').replace(/,/g, '","')}"`)

    this.downloadFile(csvString)
  }

  escapeCommas () {
    for(let i = 0; i<this.data.length; i++ ){
      let keys = Object.keys(this.data[i])
      for(let j = 0; j<keys.length; j++){
        this.data[i][keys[j]] = String(this.data[i][keys[j]]).replace(/,/g, this.escapeToken)
        if(this.data[i][keys[j]] == "null") this.data[i][keys[j]] = ""
      }
    }
  }

  unescapeCommas (csvString) {
    return csvString.replace(new RegExp(`${this.escapeToken}`, 'g'), ',');
  }

  downloadFile(csvString) {
    let filename = "Report-" + DateFormatter.getDate_ddMMyyyy() + "-" + DateFormatter.getTime_HHMMSS()
    let blob = new Blob(['\ufeff' + csvString], {
        type: 'text/csv;charset=utf-8;'
    });
    let dwldLink = document.createElement("a");
    let url = URL.createObjectURL(blob);
    let isSafariBrowser = navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1;

    //if Safari open in new window to save file with random filename.
    if (isSafariBrowser) {
        dwldLink.setAttribute("target", "_blank");
    }
    dwldLink.setAttribute("href", url);
    dwldLink.setAttribute("download", filename + ".csv");
    dwldLink.style.visibility = "hidden";
    document.body.appendChild(dwldLink);
    dwldLink.click();
    document.body.removeChild(dwldLink);
}
}
