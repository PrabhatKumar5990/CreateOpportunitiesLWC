import { LightningElement, wire, track } from 'lwc';

import { getPicklistValues, getObjectInfo } from 'lightning/uiObjectInfoApi';
import OPPORTUNITY_OBJECT from '@salesforce/schema/Opportunity';
// importing Opprtunity fields
import NAME_FIELD from '@salesforce/schema/Opportunity.Name';
import AMOUNT_FIELD from '@salesforce/schema/Opportunity.Amount';
import AMOUNT_EURO_FIELD from '@salesforce/schema/Opportunity.Amount_Euro__c';
import DATE_FIELD from '@salesforce/schema/Opportunity.CloseDate';
import STAGE_FIELD from '@salesforce/schema/Opportunity.StageName';
import ACCOUNTID_FIELD from '@salesforce/schema/Opportunity.AccountId';
//import account felds
import Account_Name from '@salesforce/schema/Account.Name';
//import apex method
import createOpportunities from '@salesforce/apex/CreateOpportunityController.createOpportunities';
import getAccountList from '@salesforce/apex/CreateOpportunityController.getAccountList';
//import toast
import {ShowToastEvent} from 'lightning/platformShowToastEvent';

export default class CreateOpportunities extends LightningElement {

    exchangeRate_EUR_USD;
    selectedAccounts=[];
    newOpportunityList=[];
    //tracked properties
    @track error;
    @track accountRecordList;
    @track accountRecordListLoaded=false;
    accountColumns=[ {label:'Account Name', fieldName:'Name', type:'text'} ];
    
    
    // this object have record information
    @track opportunityRecord = {
        Name : NAME_FIELD,
        Amount : AMOUNT_FIELD,
        CloseDate : DATE_FIELD,
        StageName : STAGE_FIELD,
        Amount_Euro__c: AMOUNT_EURO_FIELD,
        AccountId: ACCOUNTID_FIELD
    };

    @wire(getObjectInfo, { objectApiName: OPPORTUNITY_OBJECT })
    oppObjectInfo;

    @wire(getPicklistValues, { recordTypeId: '$oppObjectInfo.data.defaultRecordTypeId', fieldApiName: STAGE_FIELD })
    stagePicklistValues;

    
    //init
    connectedCallback(){
        //load currency exchange rate
        this.euroExchange('USD');        

        //load account list
        getAccountList()
            .then(result=>{
                console.log('account list result==>', result);
                this.accountRecordList=result;
                this.accountRecordListLoaded=true;
            })
            .catch(error=>{
                this.accountRecordList=null;
                this.error=error;
                this.dispatchEvent(new ShowToastEvent({
                    title: 'Error!!',
                    message: 'Failed to load Account List',
                    variant: 'error'
                }));
                this.accountRecordListLoaded=true;
            });
    }
    //track opportunity field value change
    handleOppFieldChange(event) {
        if(event.target.name==='opportunityName'){
            this.opportunityRecord.Name = event.target.value;
            console.log('Name ==> '+ this.opportunityRecord.Name);
        }
        if(event.target.name==='opportunityAmount'){
            this.opportunityRecord.Amount = event.target.value;
            console.log('Amount ==> '+ this.opportunityRecord.Amount);
            this.opportunityRecord.Amount_Euro__c= +((this.exchangeRate_EUR_USD * this.opportunityRecord.Amount).toFixed(2));
            console.log('Amount(Euro) ==> '+ this.opportunityRecord.Amount_Euro__c);
        }        
        if(event.target.name==='opportunityDate'){
            this.opportunityRecord.CloseDate = event.target.value;
            console.log('Date ==> '+ this.opportunityRecord.CloseDate);
        }
        if(event.target.name==='opportunityStage'){
            this.opportunityRecord.StageName = event.detail.value;
            console.log('Stage ==> '+ this.opportunityRecord.StageName);
        }        
        
    }

    //final submit
    handleSave(){
        //clear newOpportunity list
        this.newOpportunityList=[];
        //update oportunity with selected account Ids
        this.selectedAccounts.forEach(account => {
            let newOpportunity=JSON.parse(JSON.stringify(this.opportunityRecord));
            newOpportunity.AccountId=account.Id;
            this.newOpportunityList.push(newOpportunity);
        });
        console.log('final opportunity list ==> ', this.newOpportunityList);
        createOpportunities({opportunityList:this.newOpportunityList})
            .then(result=>{
                // Clear the user enter values
                this.opportunityRecord = {};

                console.log('result ===> '+ result);
                // Show success messsage
                this.dispatchEvent(new ShowToastEvent({
                    title: 'Success!!',
                    message: 'Opportunities have Created Successfully!!',
                    variant: 'success'
                }));
            })
            .catch(error=>{                
                console.log('save error ==> ',error);                
                this.error = error.body.message || 'Opportunity save Failed';
                // Show error messsage
                this.dispatchEvent(new ShowToastEvent({
                    title: 'Error!!',
                    message: this.error,
                    variant: 'error'
                }));
            });
    }

    //rate exchange
    euroExchange(baseCurrency){
        fetch('https://api.exchangeratesapi.io/latest')
        .then((response)=> response.json())
        .then(data=>{
            console.log('currency rates ==> ',data);
            let rate=data.rates[baseCurrency];
            this.exchangeRate_EUR_USD=rate;
            console.log('exchange rate ==>', this.exchangeRate_EUR_USD);            
        })
        .catch(error=>{
            console.error('Currency exchange error ==> ', error);
            this.exchangeRate_EUR_USD=0;
        });
    }

    //account selection
    handleAccountSelection(event){
        this.selectedAccounts=event.detail.selectedRows;
        console.log('selectedRows ==> ',this.selectedAccounts);
    }

}