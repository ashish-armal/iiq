var pairs =
{
"perform":{"object":1}
,"object":{"list":1}
,"list":{"access":1,"details":1}
,"access":{"review":1,"object":1,"reviews":1}
,"note":{"options":1,"bulk":1}
,"options":{"available":1}
,"available":{"access":1}
,"review":{"dependent":1,"decisions":1}
,"dependent":{"configuration":1}
,"configuration":{"identityiq":1}
,"identityiq":{"option":1}
,"option":{"defined":1}
,"defined":{"certification":1}
,"certification":{"scheduled":1}
,"bulk":{"decisions":1,"decision":1}
,"decisions":{"reassign":1,"click":1}
,"reassign":{"items":1}
,"items":{"decision":1,"individually":1,"select":1}
,"decision":{"maker":1,"column":1,"list":1}
,"details":{"access":1}
,"reviews":{"page":1}
,"page":{"directly":1}
,"directly":{"home":1}
,"home":{"page":1}
,"select":{"items":1,"action":1,"multiple":1}
,"individually":{"select":1}
,"action":{"decision":1,"bulk":1}
,"multiple":{"items":1}
,"click":{"save":1,"sign":1,"finish":1}
,"save":{"changes":1}
,"sign":{"display":1,"dialog":1}
,"display":{"sign":1}
,"finish":{"complete":1}
,"complete":{"access":1}
}
;Search.control.loadWordPairs(pairs);
