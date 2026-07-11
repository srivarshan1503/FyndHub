from fastapi import FastAPI, File, UploadFile
from PIL import Image
from transformers import CLIPProcessor, CLIPModel
import torch
import io
from pydantic import BaseModel

app = FastAPI()

model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")

@app.get("/")
async def root():
    return {"message": "whereismine AI service is running"}

@app.post("/embed")
async def embed_image(file: UploadFile = File(...)):
    try:
        image_bytes = await file.read()
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        
        inputs = processor(images=[image], return_tensors="pt")
        
        with torch.no_grad():
            outputs = model.vision_model(pixel_values=inputs["pixel_values"])
            embedding = outputs.pooler_output  
        
        embedding = embedding.tolist()[0]
        print('Embedding generated, length:', len(embedding))
        return {"embedding": embedding}
    except Exception as e:
        print('Error:', str(e))
        return {"error": str(e)}

class SimilarityRequest(BaseModel):
    embedding1: list[float]
    embedding2: list[float]

@app.post("/similarity")
async def get_similarity(request: SimilarityRequest):
    try:
        similarity = torch.nn.functional.cosine_similarity(torch.tensor(request.embedding1).unsqueeze(0), torch.tensor(request.embedding2).unsqueeze(0))
        print('similarity :', similarity.item())
        return {"similarity": similarity.item()}
    except Exception as e:
        print('Error :', str(e))
        return {"error": str(e)}




