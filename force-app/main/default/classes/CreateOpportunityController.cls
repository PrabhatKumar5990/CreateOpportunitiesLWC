public inherited sharing class CreateOpportunityController {

    @AuraEnabled
    public static void createOpportunities(List<Opportunity> opportunityList){
        try{
            system.debug('opportunityList ==> ' + opportunityList);
            //Integer i=0;
            insert opportunityList;
            /*Database.SaveResult[] savedOpportunites= Database.insert(opportunityList,false);
            for(Database.SaveResult result: savedOpportunites){
                System.debug('saved opportunity ' + i +' ==> ' +result);
                i+=1;
            }*/
        }
        catch(Exception ex) {
            throw new AuraHandledException(ex.getMessage());
        }
    }

    @AuraEnabled(cacheable=true)
    public static List<Account> getAccountList(){
        return [SELECT Id, Name FROM Account Limit 20];        
    }
}