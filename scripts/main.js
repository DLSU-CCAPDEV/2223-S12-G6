
const revDivNode = document.createElement("div");
revDivNode.className="review";
revDivNode.textContent="INSERT REVIEW/S HERE";
revDivNode.hidden=false;

window.onload = function()
{
    //Gets all the store divs and store buttons, as in the future
    // we will have multiple stores. Also adds an id to them automatically
    // upon loading. Personally makes it easier but if theres another way
    // go ahead lang.
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

/*
Function for what happens on click of a store's name
*/
function storeClick(id, x)
{
    var me = document.getElementById(id);
    var store = me.parentNode;
    var storeid = store.id;
    var stores = document.getElementsByClassName("store");

    //Ensures only one store is expanded at one time
    for(x =0;x<stores.length;x++)
    {
        stores[x].style.height="100px";
    }

    //Appends the Review Div Node to the clicked store.
    //Needs functionailty that the reviews change for each store.
    if(![...store.children].includes(revDivNode))
    {
        document.getElementById(storeid).style.height="400px";
        store.append(revDivNode);
    }
    else
    {
        document.getElementById(storeid).style.height="100px";
        store.removeChild(revDivNode);
    }

    //Placeholder functionally for onlick events for reviews,
    // ie, clicking the review will do something, in this case
    // it will turn the text into "Banana"
    var revs = document.getElementsByClassName("review");
    for(i=0;i<revs.length;i++)
    {
        revs[i].onclick = function review()
        {
            this.innerHTML="Banana";
        }
    }
}