var pairs =
{
"perform":{"identity":1}
,"identity":{"list":1}
,"list":{"access":1,"decision":1}
,"access":{"review":1,"identity":1,"reviews":1}
,"note":{"options":1,"bulk":1}
,"options":{"available":1}
,"available":{"access":1}
,"review":{"dependent":1,"tab":1,"decisions":1,"return":1}
,"dependent":{"configuration":1}
,"configuration":{"identityiq":1}
,"identityiq":{"option":1}
,"option":{"defined":1}
,"defined":{"certification":1}
,"certification":{"scheduled":1,"dialog":1}
,"bulk":{"decisions":1,"decision":1}
,"decisions":{"reassign":1,"move":1,"review":1}
,"reassign":{"items":1}
,"items":{"decision":1,"individually":1,"select":1,"review":1}
,"decision":{"maker":1,"access":1,"column":1,"list":1,"display":1}
,"reviews":{"page":1}
,"page":{"directly":1}
,"directly":{"home":1}
,"home":{"page":1}
,"select":{"items":1,"action":1,"multiple":1}
,"individually":{"select":1}
,"action":{"decision":1,"bulk":1}
,"multiple":{"items":1}
,"click":{"save":1,"sign-off":1,"finish":1}
,"save":{"decisions":1}
,"move":{"completed":1}
,"completed":{"items":1}
,"tab":{"required":1}
,"required":{"changes":1}
,"sign-off":{"decision":1}
,"display":{"sign":1}
,"sign":{"certification":1}
,"finish":{"complete":1}
,"complete":{"access":1}
,"return":{"access":1}
}
;Search.control.loadWordPairs(pairs);
