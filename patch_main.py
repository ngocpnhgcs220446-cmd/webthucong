with open("src/main.jsx", "r") as f:
    text = f.read()

text = text.replace("console.log('App loaded: v2');\n", "")
text = text.replace("console.log('App loaded: v3');\n", "")
text = text.replace("console.log('App loaded: v2');", "")
text = text.replace("console.log('App loaded: v3');", "")

with open("src/main.jsx", "w") as f:
    f.write(text)
print("Main patched.")
