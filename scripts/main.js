/*window.onload = function()
{
    document.getElementById("reviews").style.display="none";
    document.getElementById("store").style.height="90%";
}
*/
function test()
{
    document.getElementById("test").innerHTML="clicked";
    document.getElementById("button").innerHTML="Clickewd";
}

function storeClick()
{

    var revs = document.getElementsByClassName("review");
    for(i=0;i<revs.length;i++)
    {
        revs[i].onclick = function review()
        {
            this.innerHTML="Banana";
        }
    }
}