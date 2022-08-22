
# **Apirone Donation Widget**

**[Apirone](https://apirone.com) Donation Widget** is an ultra simple vanilla JS based widget that can be used as a donation widget for any platform or service.
 
![Apirone Donation Widget example](https://apirone.com/static/donation-widget.png)

## **Usage**
---

### **Download and host yourself** 

[**Development version**](https://github.com/Apirone/donation-widget/blob/main/js/widget.js)  - uncompressed. Intended for debugging.

[**Production version**](https://github.com/Apirone/donation-widget/blob/main/js/widget.min.js) - minified version.

### **Add container**

Include a container (eg `<div>`) with id attribute in your html document:
```
<div id="__apr-donate-widget"></div>
```

### **Add script**
Add a `<script>` tag with some custom parameters:

```
<script src="./js/widget.min.js?acc=apr-52858a8bb6f784d6245cfa0a97dae323&amounts=100,200,500,1000&fiat-currency=usd" async id="__apr-donate-script"></script>
```


## **Parameters**
---

|Parameter     |Type       |Default Value|Descriptoin|
|--------------|-----------|----------|----------:|
|acc           |string in the format "apr-..."|none (required)|account in Apirone system|
|title         |string|empty string|title|
|description   |string|empty string|description|
|amounts       |numbers separated by commas|none (required)|amount options|
|fiat-currency |alphabetic currency code|none (required)|selected fiat currency|
|border-radius |number (without "px")|0|corner radius of (almost) all elements|
|primary-color |HEX without "#"|"397cb0"|the main color of the widget (buttons, borders, etc.)|
|default-crypto|cryptocurrency ticker symbol|none (no cryptocurrency selected)|the cryptocurrency that will be selected upon loading|
|debug-mode    |boolean|false|adds testnet coins|