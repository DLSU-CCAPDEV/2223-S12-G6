window.onload = function()
{
    const e1 = document.querySelector('#email');
    const e2 = document.querySelector('#uname');
    const e3 = document.querySelector('#psw');
    const e4 = document.querySelector('#psw-repeat');

    var flag1=false;
    var flag2=false;
    var flag3=false;
    var flag4=false;

    e1.addEventListener("input",function()
    {
        var value = e1.value;
        var http = new XMLHttpRequest();
        http.onreadystatechange = function()
        {
            if(this.readyState == 4 && this.status==200)
            {
                console.log(this.responseText);
                if(this.responseText==="gagi-wag")
                {
                    
                    flag1 = false;
                    document.querySelector(".registerbtn").disabled = true;
                    document.querySelector("#errorEm").hidden = false;
                }
                else
                {
                    flag1 = true;
                    document.querySelector("#errorEm").hidden = true;
                }
                    
            }
        }
        http.open("GET","/emailCheck?email="+value,false);
        http.send();
    });

    e2.addEventListener("input", function()
    {
        var value = e2.value;
        var http = new XMLHttpRequest();
        http.onreadystatechange = function()
        {
            console.log(this.responseText);
            if(this.readyState == 4 && this.status==200)
            {
                if(this.responseText==="gagi-wag")
                {
                    
                    flag2 = false;
                    document.querySelector(".registerbtn").disabled = true;
                    document.querySelector("#errorNa").hidden = false;
                }
                else
                {
                    flag2 = true;
                    document.querySelector("#errorNa").hidden = true;
                }
                    
            }
        }
        http.open("GET","/nameCheck?name="+value,false);
        http.send();
    });

    e3.addEventListener("input", function()
    {
        var value = e3.value;
        if(value.length < 8)
        {
            flag3 = false;
            document.querySelector(".registerbtn").disabled = true;
            document.querySelector("#errorPassLength").hidden = false;
        }
        else
        {
            flag3 = true;
            document.querySelector("#errorPassLength").hidden = true;
        }
            
    });

    e4.addEventListener("input", function()
    {
        var value = e4.value;
        if(value !== e3.value)
        {
            flag4 = false;
            document.querySelector(".registerbtn").disabled = true;
            document.querySelector("#errorPassSame").hidden = false;
        }
        else
        {
            flag4 = true;
            document.querySelector("#errorPassSame").hidden = true;
        }
            
    })
    window.addEventListener("mousemove", function()
    {
        console.log(flag1+flag2+flag3+flag4);
        if(flag1&&flag2&&flag3&&flag4)
        {
            document.querySelector(".registerbtn").disabled = false;
        }
        else
        {
            document.querySelector(".registerbtn").disabled = true;
        }
    })
}
