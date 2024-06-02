from chatbot_utils.KoGPT2Utils import *
import torch
from transformers import GPT2LMHeadModel


class TextGeneratorPredict:
    def __init__(self, weight_path, device):
        print("[INFO] LOADING <Text-Generator_Model> ...")

        self.device = device
        self.weight_path = weight_path
        print(f"\t[INFO] DEVICE = {self.device}")

        print("\t[INFO] GET <KoGPT2-Tokenizer> ...")
        self.tokenizer = TOKENIZER

        print("\t[INFO] LOADING <KoGPT2-Model> ...")
        self.model = GPT2LMHeadModel.from_pretrained('skt/kogpt2-base-v2')

        print("\t[INFO] APPLYING <text-generator weights> ...")
        self.model.load_state_dict(torch.load(self.weight_path, map_location=self.device))
        self.model.eval()

        print("[DONE] LOAD <Text-Generator_Model> SUCCESS")

    def sample_sequence(self, q, max_len=40, temperature=1.0, top_k=50, top_p=0.9):
        with torch.no_grad():
            a = ""
            for _ in range(max_len):
                input_ids = torch.LongTensor(
                    self.tokenizer.encode(Q_TKN + q + SENT + A_TKN + a)
                ).unsqueeze(dim=0).to(self.device)
                pred = self.model(input_ids)
                logits = pred.logits[:, -1, :] / temperature
                filtered_logits = top_k_top_p_filtering(logits, top_k=top_k, top_p=top_p)
                probabilities = torch.nn.functional.softmax(filtered_logits, dim=-1)
                gen_id = torch.multinomial(probabilities, num_samples=1).item()
                if gen_id >= self.tokenizer.vocab_size:
                    print(f"Invalid token ID: {gen_id}")
                    break
                gen = self.tokenizer.convert_ids_to_tokens([gen_id])[0]
                if gen == EOS:
                    break
                a += gen.replace("▁", " ")
            return a.strip()

    def generate_answer(self, usr_input):
        answer = self.sample_sequence(usr_input, max_len=max_len, temperature=0.5, top_k=20, top_p=0.9)
        return answer

# # 모델 불러오기
# device = torch.device("cpu")
# weight_path = "../weights/textGenerator_weights.pth"


# def load_model(model_path, device):
#     print("[INFO] loading Text-Generator Model...")
#     model = GPT2LMHeadModel.from_pretrained("skt/kogpt2-base-v2")
#     model.load_state_dict(torch.load(model_path, map_location=device))
#     model.eval()
#     print("[INFO] Text-Generator Model Loaded Successfully!")
#     return model
#
#
# # 답변 생성 함수
# def sample_sequence(model, tokenizer, q, max_len=40, temperature=1.0, top_k=50, top_p=0.9):
#     model.eval()
#     with torch.no_grad():
#         a = ""
#         for _ in range(max_len):
#             input_ids = torch.LongTensor(
#                 tokenizer.encode(Q_TKN + q + SENT + A_TKN + a)
#             ).unsqueeze(dim=0).to(device)
#             pred = model(input_ids)
#             logits = pred.logits[:, -1, :] / temperature
#             filtered_logits = top_k_top_p_filtering(logits, top_k=top_k, top_p=top_p)
#             probabilities = torch.nn.functional.softmax(filtered_logits, dim=-1)
#             gen_id = torch.multinomial(probabilities, num_samples=1).item()
#             if gen_id >= tokenizer.vocab_size:
#                 print(f"Invalid token ID: {gen_id}")
#                 break
#             gen = tokenizer.convert_ids_to_tokens([gen_id])[0]
#             if gen == EOS:
#                 break
#             a += gen.replace("▁", " ")
#         return a.strip()
#
#
# # 테스트
# with torch.no_grad():
#     model = load_model(weight_path, device)
#     while True:
#         q = input("user > ").strip()
#         if q == "quit" or q == "exit":
#             break
#         # temperature : 샘플링 온도로, 낮은 값은 덜 무작위 적이고, 높은 값은 더 무작위적인 결과를 만듬.
#         response = sample_sequence(model, tokenizer, q, max_len=max_len, temperature=0.5, top_k=20, top_p=0.9)
#         print(f"Chatbot > {response}")