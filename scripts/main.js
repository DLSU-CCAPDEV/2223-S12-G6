
const revDivNode = document.createElement("div");
revDivNode.className="review";
revDivNode.textContent="INSERT REVIEW/S HERE";

window.onload = function()
{
    var buttons = document.getElementsByClassName("storename");
    var stores = document.getElementsByClassName("store");
    for(x=0;x<=stores.length;x++)
    {
        stores[x].id = "store"+x;
        buttons[x].id = "button"+x;
        buttons[x].onclick = function disp()
        {   
            storeClick(this.id, x);
        }
    }
    
}
function test()
{
    document.getElementById("test").innerHTML="clicked";
    document.getElementById("button").innerHTML="Clickewd";
}

function storeClick(id, x)
{
    me = document.getElementById(id);
    store = me.parentNode;
    if(![...store.children].includes(revDivNode))
            store.append(revDivNode);
    else
            store.removeChild(revDivNode);

    var revs = document.getElementsByClassName("review");
    for(i=0;i<revs.length;i++)
    {
        revs[i].onclick = function review()
        {
            this.innerHTML="Banana";
        }
    }
}