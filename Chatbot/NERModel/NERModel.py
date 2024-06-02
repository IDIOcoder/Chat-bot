import torch
from transformers import ElectraTokenizerFast
from transformers import ElectraForTokenClassification


class NERModel:
    def __init__(self, weight_path, device):
        print("[INFO] LOADING <NER-model> ...")

        self.tag2idx = {"O": 0, "B-FOOD": 1, "I-FOOD": 2}
        self.idx2tag = {v: k for k, v in self.tag2idx.items()}
        self.device = device
        self.weight_path = weight_path
        print(f"\t[INFO] DEVICE = {self.device}")

        print(f"\t[INFO] GET <KoELECTRA-Tokenizer> ...")
        self.tokenizer = ElectraTokenizerFast.from_pretrained('monologg/koelectra-base-v3-discriminator')

        print(f"\t[INFO] LOADING <KoELECTRA-Model> ...")
        self.model = ElectraForTokenClassification.from_pretrained('monologg/koelectra-base-v3-discriminator', num_labels=len(self.tag2idx))

        print(f"\t[INFO] APPLYING <ner weights> ...")
        self.model.load_state_dict(torch.load(self.weight_path, map_location=self.device))

        print("[DONE] LOAD <NER Model> SUCCESS")

    def predict(self, sentence):
        self.model.eval()
        inputs = self.tokenizer(sentence, return_tensors="pt", padding=True, truncation=True, max_length=128)

        with torch.no_grad():
            inputs = {k: v.to(self.device) for k, v in inputs.items()}
            outputs = self.model(**inputs)
            logits = outputs.logits
            predictions = torch.argmax(logits, dim=-1).squeeze().tolist()
            # print(predictions)

        tokenized_input = self.tokenizer.convert_ids_to_tokens(inputs['input_ids'].squeeze().tolist())
        # print(tokenized_input)

        result = []
        for token, pred in zip(tokenized_input, predictions):
            if token.startswith('##'):
                result[-1][0] += token[2:]
            else:
                result.append([token, self.idx2tag[pred]])

        return result
