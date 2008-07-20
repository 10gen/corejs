/**
*      Copyright (C) 2008 10gen Inc.
*  
*    Licensed under the Apache License, Version 2.0 (the "License");
*    you may not use this file except in compliance with the License.
*    You may obtain a copy of the License at
*  
*       http://www.apache.org/licenses/LICENSE-2.0
*  
*    Unless required by applicable law or agreed to in writing, software
*    distributed under the License is distributed on an "AS IS" BASIS,
*    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
*    See the License for the specific language governing permissions and
*    limitations under the License.
*/

ws.FogBugz.ALL_COLUMNS = {
    c  : true ,
    dtClosed  : true ,
    dtDue  : true ,
    dtFixFor  : true ,
    dtLastUpdated  : true ,
    dtLastView  : true ,
    dtOpened  : true ,
    dtResolved  : true ,
    fForwarded  : true ,
    fOpen  : true ,
    fReplied  : true ,
    fScoutStopReporting  : true ,
    fSubscribed  : true ,
    hrsCurrEst  : true ,
    hrsElapsed  : true ,
    hrsOrigEst  : true ,
    ixArea  : true ,
    ixBug  : true , 
    ixBugEventLastView  : true ,
    ixBugEventLatest  : true ,
    ixBugEventLatestText  : true ,
    ixCategory  : true ,
    ixDiscussTopic  : true ,
    ixFixFor  : true ,
    ixGroup  : true ,
    ixMailbox  : true ,
    ixPersonAssignedTo  : true ,
    ixPersonClosedBy  : true ,
    ixPersonLastEditedBy  : true ,
    ixPersonOpenedBy  : true ,
    ixPersonResolvedBy  : true ,
    ixPriority  : true ,
    ixProject  : true ,
    ixRelatedBugs  : true ,
    ixStatus  : true ,
    sArea  : true ,
    sCategory  : true ,
    sComputer  : true ,
    sCustomerEmail  : true ,
    sEmailAssignedTo  : true ,
    sFixFor  : true ,
    sLatestTextSummary  : true ,
    sPersonAssignedTo  : true ,
    sPriority  : true ,
    sProject  : true ,
    sReleaseNotes  : true ,
    sScoutDescription  : true ,
    sScoutMessage  : true ,
    sStatus  : true ,
    sTicket  : true ,
    sTitle  : true ,
    sVersion : true
};

ws.FogBugz.ALL_COLUMNS_STRING = ws.FogBugz.ALL_COLUMNS.keySet().join( "," );
