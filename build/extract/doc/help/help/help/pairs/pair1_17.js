var pairs =
{
"complete":{"access":1,"delegated":1,"revocation":1,"reassigned":1}
,"access":{"review":1,"reviews":1}
,"review":{"work":1}
,"work":{"items":1}
,"items":{"following":1,"originally":1,"include":1,"delegated":1,"complete":1}
,"following":{"procedures":1}
,"procedures":{"list":1}
,"list":{"steps":1}
,"steps":{"complete":1}
,"originally":{"assigned":1}
,"assigned":{"different":1}
,"different":{"approver":1}
,"approver":{"require":1}
,"require":{"member":1,"approval":1,"revocation":1}
,"member":{"workgroup":1}
,"workgroup":{"members":1,"action":1}
,"members":{"workgroup":1}
,"action":{"access":1}
,"include":{"items":1}
,"delegated":{"reassigned":1,"access":1}
,"reassigned":{"forwarded":1}
,"forwarded":{"require":1,"access":1}
,"approval":{"require":1}
,"revocation":{"actions":1,"work":1,"request":1}
,"actions":{"complete":1}
,"reviews":{"complete":1,"perform":1,"challenge":1}
,"perform":{"multi-level":1}
,"multi-level":{"sign":1}
,"sign":{"access":1}
,"challenge":{"revocation":1}
}
;Search.control.loadWordPairs(pairs);
