import base64
import os

image_path = r'C:\Users\USER\Desktop\tarot\public\hero.png' # I need to know where it is
# Actually, the generated image is in the brain directory.
# Let's find the exact path from the previous output.
brain_path = r'C:\Users\USER\.gemini\antigravity\brain\85228e03-3cc5-4d65-b278-f24c5afb90f7\hero_final_1777942860165.png'

with open(brain_path, "rb") as image_file:
    encoded_string = base64.b64encode(image_file.read()).decode('utf-8')
    print(f"data:image/png;base64,{encoded_string}")
