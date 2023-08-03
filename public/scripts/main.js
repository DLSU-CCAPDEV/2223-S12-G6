const revDivNode = document.createElement("div");
revDivNode.className="review";
revDivNode.textContent="INSERT REVIEW/S HERE";
revDivNode.hidden=false;

const revNode = document.createElement("form");
revNode.id = "leaveReview";
revNode.action = "ReviewForUserAccessOnly";
revNode.method = "GET";

const submitNode = document.createElement("input");
submitNode.type = "submit";
submitNode.name = "submitButton";
submitNode.value = "Leave A Review Here!";

const hiddenNameNode = document.createElement("input");
hiddenNameNode.type = "text";
hiddenNameNode.id = "storeName";
hiddenNameNode.name ="storeName";
hiddenNameNode.hidden = true;

revNode.appendChild(submitNode);
revNode.appendChild(hiddenNameNode);

window.onload = function()
{
    //Gets all the store divs and store buttons, as in the future
    // we will have multiple stores. Also adds an id to them automatically
    // upon loading. Personally makes it easier but if theres another way
    // go ahead lang.
    if(localStorage.getItem("loggedin")=="true")
    {
        document.querySelector('#person').innerHTML="PROFILE";
        document.querySelector('#person').href = "editProfile";
    }

    var buttons = document.getElementsByClassName("storename");
    var stores = document.getElementsByClassName("store");
    for(x=0;x<=stores.length;x++)
    {
        stores[x].id = "store"+x;
        buttons[x].id = "button"+x;
        var name = stores[x].querySelector('.storename').innerHTML;
        if(localStorage.getItem('reviews'+name))
        {
            var revs = JSON.parse(localStorage.getItem('reviews'+name));
            var rating = 0;
            var y =0;
            revs.forEach(element => {
                y++;
                rating += element.rating;
            });
            rating /=y;
            stores[x].querySelector('.rating').innerHTML = Math.round(rating*100)/100;
        }
        else
        stores[x].querySelector('.rating').innerHTML = "No Ratings";
        
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
    console.log("Storeclick");
    while(revDivNode.firstChild)
    {
        revDivNode.removeChild(revDivNode.lastChild);
    }
    var me = document.getElementById(id);
    var store = me.parentNode;
    var storeid = store.id;
    var stores = document.getElementsByClassName("store");
    var desc = document.getElementsByClassName('description');
    //var rating = 0;
    hiddenNameNode.value = store.querySelector('.storename').innerHTML;
    console.log(hiddenNameNode.value);
    localStorage.setItem("nameOfStore",hiddenNameNode.value);
    var x = 0;
    if(localStorage.getItem('reviews'+hiddenNameNode.value))
    {
        var reviews = JSON.parse(localStorage.getItem('reviews'+hiddenNameNode.value));
        reviews.forEach(element => {
            x++;
            if(x<5)
            {
                var revPreview = document.createElement("p");
                revPreview.className = "revPrev";
                if(element.comment.length<50)
                revPreview.innerHTML = `<p>${element.name}: ${element.rating} star(s): ${element.comment}</p>`;
                else
                revPreview.innerHTML = `<p>${element.name}: ${element.rating} star(s): ${element.comment.substring(0,50)}...</p>`;
                revDivNode.append(revPreview);
            }
            //rating += element.rating;
        });
    }
    //rating = rating/x;
    //store.querySelector('.rating').innerHTML = rating;

    //store.children.item(2).innerHTML = rating;

    //Ensures only one store is expanded at one time
    for(x =0;x<stores.length;x++)
    {
        stores[x].style.height="100px";
        stores[x].querySelector('.description').hidden=true;
    }
    store.querySelector('.description').hidden=false;
    //Appends the Review Div Node to the clicked store.
    //Needs functionailty that the reviews change for each store.
    if(![...store.children].includes(revDivNode))
    {
        document.getElementById(storeid).style.height="600px";
        me.style.opacity=1;
        store.append(revDivNode);
        store.append(revNode);
        store.querySelector('.description').hidden=false;
    }
    else
    {
        document.getElementById(storeid).style.height="100px";
        me.style.opacity=0.5
        store.removeChild(revDivNode);
        store.removeChild(revNode);
        store.querySelector('.description').hidden=true;
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

function search()
{
    var x = document.getElementById('searchbar').value;
    x = x.toUpperCase();
    
    var stores = document.querySelectorAll('.store');

    if(x!="")
    {
        stores.forEach(store => {
        store.hidden=true;
        if(store.querySelector('.storename').innerHTML.includes(x))
        {
            store.hidden=false;
        }
        });
    }
    else
    {
        stores.forEach(store =>{
            store.hidden=false;
        })
    }
    
}