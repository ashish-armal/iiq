var pairs =
{
"batch":{"request":1,"requests":1}
,"request":{"types":1,"pipe":1,"details":1,"page":1,"create":1,"createidentity":1,"modify":1,"modifyidentity":1,"createaccount":1,"delete":1,"deleteaccount":1,"enable":1,"enableaccount":1,"disableaccount":1,"unlock":1,"unlockaccount":1,"add":1,"addrole":1,"actual":1,"remove":1,"removerole":1,"addentitlement":1,"removeentitlement":1,"change":1,"changepassword":1}
,"types":{"examples":1,"criteria":1,"batch":1,"similar":1,"separate":1}
,"examples":{"section":1,"identityiq":1}
,"section":{"describes":1}
,"describes":{"batch":1}
,"criteria":{"required":1}
,"required":{"comma-delimited":1}
,"comma-delimited":{"file":1,"spreadsheet":1}
,"file":{"examples":1,"following":1}
,"identityiq":{"supports":1}
,"supports":{"following":1}
,"following":{"types":1,"batch":1}
,"create":{"identity":1,"account":1,"batch":1,"list":1,"accounts":1}
,"modify":{"identity":1,"change":1}
,"delete":{"account":1,"accounts":1}
,"enable\u002Fdisable":{"account":1}
,"unlock":{"account":1,"application":1}
,"add":{"role":1,"entitlement":1,"roles":1,"entitlements":1}
,"remove":{"role":1,"entitlement":1,"roles":1,"entitlements":1}
,"change":{"password":1,"data":1,"reset":1}
,"similar":{"data":1}
,"data":{"columns":1,"list":1}
,"columns":{"mixed":1}
,"mixed":{"file":1}
,"separate":{"file":1,"role":1}
,"note":{"specify":1,"add":1}
,"specify":{"multiple":1}
,"multiple":{"entitlements":1}
,"entitlements":{"roles":1,"list":1}
,"roles":{"request":1,"list":1,"identityname":1}
,"pipe":{"(|)":1}
,"(|)":{"delimiter":1}
,"delimiter":{"separate":1}
,"role":{"entitlement":1,"add":1,"batch":1,"display":1,"used":1,"remove":1}
,"additional":{"information":1}
,"requests":{"page":1,"dashboard":1}
,"details":{"page":1}
,"identity":{"create":1,"batch":1,"modify":1}
,"list":{"identities":1}
,"identities":{"prepared":1}
,"prepared":{"comma-delimited":1}
,"spreadsheet":{"operation":1,"create":1,"modify":1,"delete":1,"enable":1,"disable":1,"unlock":1,"add":1,"remove":1,"change":1}
,"operation":{"spreadsheet":1,"name":1,"identityname":1,"application":1,"roles":1}
,"name":{"location":1,"role":1}
,"location":{"email":1}
,"email":{"department":1,"createaccount":1,"deleteaccount":1}
,"department":{"createidentity":1,"modifyidentity":1}
,"createidentity":{"alex":1,"bob":1,"mark":1,"john":1}
,"alex":{"smith":1}
,"smith":{"austin":1}
,"austin":{"asmith@adept.com":1,"johnsmith@adept.com":1}
,"asmith@adept.com":{"accounting":1,"engineering":1}
,"accounting":{"createidentity":1,"modifyidentity":1,"222":1}
,"bob":{"smith":1}
,"engineering":{"createidentity":1,"modifyidentity":1}
,"mark":{"smith":1}
,"john":{"smith":1}
,"johnsmith@adept.com":{"finance":1}
,"identityname":{"location":1,"email":1,"enableaccount":1,"unlockaccount":1,"addrole":1,"removerole":1,"addentitlement":1,"removeentitlement":1,"changepassword":1}
,"modifyidentity":{"alex":1,"bob":1,"mark":1,"john":1}
,"account":{"create":1,"batch":1,"delete":1,"enable\u002Fdisable":1,"unlock":1}
,"accounts":{"list":1,"specific":1}
,"application":{"nativeidentity":1,"list":1,"accounts":1,"attributename":1,"password":1}
,"nativeidentity":{"identityname":1}
,"createaccount":{"adminsapp":1}
,"adminsapp":{"atoby":1,"jsmith":1,"abell":1,"mjohnson":1}
,"atoby":{"atoby@example.com":1}
,"atoby@example.com":{"createaccount":1,"deleteaccount":1}
,"jsmith":{"jsmith@example.com":1,"enableaccount":1,"unlockaccount":1,"changepassword":1}
,"deleteaccount":{"adminsapp":1}
,"enable":{"disable":1,"account":1}
,"disable":{"accounts":1,"account":1}
,"specific":{"application":1}
,"enableaccount":{"operation":1,"adminsapp":1}
,"abell":{"enableaccount":1,"unlockaccount":1}
,"unlockaccount":{"adminsapp":1}
,"actual":{"name":1}
,"display":{"name":1}
,"used":{"individual":1}
,"individual":{"requests":1}
,"addrole":{"helpdesk":1,"benefits":1,"accounting":1}
,"helpdesk":{"associate":1}
,"associate":{"addrole":1,"222":1,"122":1,"132":1,"143":1,"156":1}
,"benefits":{"manager":1}
,"manager":{"222":1}
,"222":{"addrole":1}
,"removerole":{"helpdesk":1}
,"122":{"removerole":1}
,"132":{"removerole":1}
,"143":{"removerole":1}
,"entitlement":{"add":1,"batch":1,"remove":1}
,"attributename":{"attributevalue":1}
,"attributevalue":{"nativeidentity":1}
,"addentitlement":{"procurement_system":1}
,"procurement_system":{"group":1,"@audit":1}
,"group":{"@audit":1}
,"@audit":{"id1":1,"id2":1,"id3":1,"id4":1,"id5":1}
,"id1":{"addentitlement":1,"removeentitlement":1}
,"id2":{"addentitlement":1,"removeentitlement":1}
,"id3":{"addentitlement":1,"removeentitlement":1}
,"id4":{"addentitlement":1,"removeentitlement":1}
,"removeentitlement":{"procurement_system":1}
,"password":{"change":1,"batch":1,"nativeidentity":1}
,"reset":{"passwords":1}
,"passwords":{"list":1}
,"changepassword":{"active_directory":1}
,"active_directory":{"1111":1}
,"1111":{"jsmith":1,"mjohson":1,"ajones":1}
,"mjohson":{"changepassword":1}
}
;Search.control.loadWordPairs(pairs);
