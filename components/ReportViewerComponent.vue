<template>
  <v-app>
    <div  ref="draggableContainerReportViewer" id="draggable-container-reportviewer"
      class="pa-0"
      @click="incrementZindex"
    >
      <v-card elevation="2" min-width="900" height="760" v-if="showflag">
        <div id="draggable-header-reportviewer" @mousedown="dragMouseDown">
          <v-row>
            <v-col cols="2">
              <span style="color: white; font-size: 12px"> Report Viewer </span>
            </v-col>
            <v-spacer> </v-spacer>
            <v-col cols="1" class="text-right">
              <v-btn  x-small  icon  dark
                @click="tellParentToHideThis" class="mr-1">
                <v-icon>mdi-power</v-icon>
              </v-btn>
            </v-col>
          </v-row>
        </div>
        <v-container style="max-height: 670px" class="overflow-y-auto">

          <v-btn @click="print" absolute right icon color="primary" class="mr-4"><v-icon>mdi-printer</v-icon> Print</v-btn>

          <v-row>
            <v-col cols="3">
              <v-select v-model="selectedReportType" dense class="caption" item-text="reporttypedescrip"  item-value="reporttypeid"
                :items="reportTypes" label="Report Type" @change="reportTypeChanged"
              >
              </v-select>
            </v-col>
            <v-col cols="2">
              <v-text-field class="caption" dense v-model="filters.dateFrom" label="Date From"
               :rules="dateRules" >
              </v-text-field>
            </v-col>
            <v-col cols="2">
              <v-text-field class="caption" dense v-model="filters.dateTo" label="Date To"
               :rules="dateRules" >
              </v-text-field>
            </v-col>
            <v-col>
              <v-btn small color="primary" @click="getReportData">Load Report</v-btn>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <div id="printMe">
                <div style="text-align: center" class="arial">
                  <v-row dense>
                    <v-col>
                      <span class="company"> {{ companyName }} </span> <br>
                      <span class="subtitle"> {{ subTitle }} </span>
                    </v-col>
                  </v-row>
                  <v-row dense>
                    <v-col>
                      <span class="reportname" > {{ reportName }} </span> <br>
                      <span class="subtitle"> As of {{ filters.dateFrom }} - {{ filters.dateTo}} </span>
                    </v-col>
                  </v-row>

                    <hr>
                    <v-row>
                      <v-col>
                        <v-data-table dense :headers="headers" :items="tableData" item-key="name"
                         class="arial elevation-1"  :hide-default-footer="true" disable-pagination>
                        </v-data-table>
                      </v-col>
                    </v-row>

                  </div>
              </div>
            </v-col>
          </v-row>

        </v-container>
      </v-card>

      <v-snackbar v-model="snackbar">
        {{ snackbartext }}
        <template v-slot:action="{ attrs }">
          <v-btn color="green" text v-bind="attrs" @click="snackbar = false">
            Close
          </v-btn>
        </template>
      </v-snackbar>
    </div>
  </v-app>
</template>

<script>
  import { mapState, mapMutations } from "vuex";
  import moment from "moment";

  export default {
    name: "ReportViewerComponent",
    props: ["showflag"],

    data: function () {
      return {
        reportTypes: [
          {reporttypeid: 1, reporttypedescrip: 'Total Item Sales'},
          {reporttypeid: 2, reporttypedescrip: 'Sales Per Item'},
          {reporttypeid: 3, reporttypedescrip: 'Receiving Transactions'},
          {reporttypeid: 4, reporttypedescrip: 'Received Items'},
        ],
        selectedReportType: 1,
        filters: {
          dateFrom: '',
          dateTo: '',
        },

        output: null,
        companyName: "The Full Name of Company",
        subTitle: "Company complete address and contact number 123123123",
        reportName: "Total Item Sales",
        dateTime: "Header",
        snackbar: false,
        snackbartext: "",
        tableData: [],
        tableHeaders: [],
        grandTotal: 0,
        pageNumber: "Page x of X",

      headers: [
        { text: 'Client', value: 'client.accountname',},
        { text: 'Price Code', value: 'pricecode' },
        { text: 'Status', value: 'transstatus' },
        { text: 'Date', value: 'transdate' },
        { text: 'Total', value: 'transtotal', align: "right", },
      ],
        positions: {
            clientX: undefined,
            clientY: undefined,
            movementX: 0,
            movementY: 0,
        },
        dateRules: [
          (v) => !!v || "Required",
          v => (v && this.validateDate(v)) || 'Invalid Date',
        ],
      }
    },
    methods: {
      ...mapMutations(["mutateZindex"]),
      async print () {
        // Pass the element id here
        await this.$htmlToPaper('printMe');
      },
      async getReportData() {
        //validate filters
        if(!this.validateDate(this.filters.dateFrom)){
          this.snackbar = true;
				  this.snackbartext = "Invalid Date-From";
        }
        else if(!this.validateDate(this.filters.dateTo)){
          this.snackbar = true;
				  this.snackbartext = "Invalid Date-To";
        }
        else
        {
          console.log('Getting report data...');
          //getting the type of report
          if(this.selectedReportType == 1){
            //Total Item Sales
            let res = await this.callApi("POST", "/itemselltrans/reporttrans", {filters: this.filters});
            if (res.data) {
              //format the headers
              this.headers = [
                { text: 'Client', value: 'client.accountname',},
                { text: 'Price Code', value: 'pricecode' },
                { text: 'Status', value: 'transstatus' },
                { text: 'Date', value: 'transdate' },
                { text: 'Total', value: 'transtotal', align: "right", },
              ],
              //format the tableData
              this.tableData = res.data;
              //get the totals
               this.grandTotal = 0;
              res.data.forEach(trans => {
                this.grandTotal += Number(trans.transtotal);
                trans.transtotal = this.commaSeparate(parseFloat(trans.transtotal).toFixed(2));
                trans.transdate = moment(trans.transdate).format('MM/DD/YYYY');
              });
              //add the total to the last row
              this.tableData.push({transtotal: this.currencyformat(this.grandTotal) });
            }
            else
            {
              console.log("There are no transactions.");
            }
          }
          if(this.selectedReportType == 3){
            //Total Item Sales
            let res = await this.callApi("POST", "/itemselltrans/reporttransreceived", {filters: this.filters});
            if (res.data) {
              //format the headers
              this.headers = [
                { text: 'Client', value: 'client.accountname',},
                { text: 'Price Code', value: 'pricecode' },
                { text: 'Status', value: 'transstatus' },
                { text: 'Date', value: 'transdate' },
                { text: 'Total', value: 'transtotal', align: "right", },
              ],
              //format the tableData
              this.tableData = res.data;
              //get the totals
               this.grandTotal = 0;
              res.data.forEach(trans => {
                this.grandTotal += Number(trans.transtotal);
                trans.transtotal = this.commaSeparate(parseFloat(trans.transtotal).toFixed(2));
                trans.transdate = moment(trans.transdate).format('MM/DD/YYYY');
              });
              //add the total to the last row
              this.tableData.push({transtotal: this.currencyformat(this.grandTotal) });
            }
            else
            {
              console.log("There are no transactions.");
            }
          }
          else if(this.selectedReportType == 2){
            let res = await this.callApi("POST", "/itemselltrans/salesperitem", {filters: this.filters});
            if (res.data) {
              console.log(res.data);
              //format the headers
              this.headers = [
                { text: 'Date', value: 'transdate' },
                { text: 'Code', value: 'itemcode',},
                { text: 'Item Description', value: 'itemdescrip',},
                { text: 'Price Code', value: 'pricecode' },
                { text: 'Pieces', value: 'totalpieces' },
                { text: 'Size', value: 'size' },
                { text: 'Quantity', value: 'quantity' },
                { text: 'Price Each', value: 'priceeach' },
                { text: 'Total', value: 'totalcost', align: "right", },
              ],
              //format the tableData
              this.grandTotal = 0;
              this.tableData = [];
              res.data.forEach(trans => {
                //get the all items in each trans

                if(trans.transitems){
                  trans.transitems.forEach(item => {
                    //compute total
                    this.grandTotal += Number(item.totalcost);
                    item.transdate =  moment(trans.transdate).format('MM/DD/YYYY');
                    item.pricecode = trans.pricecode
                    item.priceeach = this.commaSeparate(parseFloat(item.priceeach).toFixed(2));
                    item.totalcost = this.commaSeparate(parseFloat(item.totalcost).toFixed(2));
                    this.tableData.push(item);

                  })
                }
              });
              //add the total to the last row
              this.tableData.push({totalcost: this.currencyformat(this.grandTotal) });
            }
            else {
              console.log("There are no transactions.");
            }
          }
          else if(this.selectedReportType == 4){
            let res = await this.callApi("POST", "/itemselltrans/receivedperitem", {filters: this.filters});
            if (res.data) {
              console.log(res.data);
              //format the headers
              this.headers = [
                { text: 'Date', value: 'transdate' },
                { text: 'Code', value: 'itemcode',},
                { text: 'Item Description', value: 'itemdescrip',},
                { text: 'Price Code', value: 'pricecode' },
                { text: 'Pieces', value: 'totalpieces' },
                { text: 'Size', value: 'size' },
                { text: 'Quantity', value: 'quantity' },
                { text: 'Price Each', value: 'priceeach' },
                { text: 'Total', value: 'totalcost', align: "right", },
              ],
              //format the tableData
              this.grandTotal = 0;
              this.tableData = [];
              res.data.forEach(trans => {
                //get the all items in each trans

                if(trans.transitems){
                  trans.transitems.forEach(item => {
                    //compute total
                    this.grandTotal += Number(item.totalcost);
                    item.transdate =  moment(trans.transdate).format('MM/DD/YYYY');
                    item.pricecode = trans.pricecode
                    item.priceeach = this.commaSeparate(parseFloat(item.priceeach).toFixed(2));
                    item.totalcost = this.commaSeparate(parseFloat(item.totalcost).toFixed(2));
                    this.tableData.push(item);

                  })
                }
              });
              //add the total to the last row
              this.tableData.push({totalcost: this.currencyformat(this.grandTotal) });
            }
            else {
              console.log("There are no transactions.");
            }
          }
        }
      },
      validateDate(dt){
        var m = moment(dt, 'MM/DD/YYYY');
        return m.isValid();
      },
      tellParentToHideThis() {
        this.$emit("formclose", false);
      },
      reportTypeChanged(val) {
        console.log(val);
        let selectedreport = this.reportTypes.find(x => x.reporttypeid == val);
        this.reportName = selectedreport.reporttypedescrip;
      },
      incrementZindex() {
        //if form is still shown
        if (this.showflag) {
          document.getElementById("draggable-container-reportviewer").style.zIndex =
            this.$store.state.lastzindex + 1;
          document.getElementById("draggable-header-reportviewer").style.zIndex =
            this.$store.state.lastzindex + 2;
          this.mutateZindex();
        }
      },
      dragMouseDown: function (event) {
        event.preventDefault();
        // get the mouse cursor position at startup:
        this.positions.clientX = event.clientX;
        this.positions.clientY = event.clientY;
        document.onmousemove = this.elementDrag;
        document.onmouseup = this.closeDragElement;
      },
      elementDrag: function (event) {
        event.preventDefault();
        this.positions.movementX = this.positions.clientX - event.clientX;
        this.positions.movementY = this.positions.clientY - event.clientY;
        this.positions.clientX = event.clientX;
        this.positions.clientY = event.clientY;
        // set the element's new position:
        this.$refs.draggableContainerReportViewer.style.top =
          this.$refs.draggableContainerReportViewer.offsetTop -
          this.positions.movementY +
          "px";
        this.$refs.draggableContainerReportViewer.style.left =
          this.$refs.draggableContainerReportViewer.offsetLeft -
          this.positions.movementX +
          "px";
      },
      closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
      },
      currencyformat(amt) {
        return new Intl.NumberFormat("en", {
          currency: "Php",
          style: "currency",
        }).format(amt);
      },
      commaSeparate(x){
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      }

    },
    created() {
      let today = new Date();
      let firstday = new Date(today.getFullYear(),today.getMonth(),1);
      this.filters.dateFrom = moment(firstday).format('MM/DD/YYYY');
      this.filters.dateTo = moment().format('MM/DD/YYYY');

    }
  }
</script>

<style scoped>

</style>
