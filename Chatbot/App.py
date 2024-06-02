import os
import torch
import json
import numpy as np
np.bool = np.bool_
import EmotionModel.EmotionClassifierPredict as EM
import TextModel.TextGeneratorPredict as TM
import IntentModel.IntentClassifierPredict as IM
import NERModel.NERModel as NM


# 병렬 처리 경고 출력 X
os.environ['TOKENIZERS_PARALLELISM'] = 'false'


class ChatBot:
    def __init__(self):
        with open('config.json', 'r') as f:
            self.config = json.load(f)
        self.device = torch.device('cpu')
        self.intent_model = IM.IntentClassifierPredict(self.config["intent_path"], self.device)
        self.emotion_model = EM.EmotionClassifierPredict(self.config["emotion_path"], self.device)
        self.text_model = TM.TextGeneratorPredict(self.config["text_path"], self.device)
        self.ner_model = NM.NERModel(self.config["ner_path"], self.device)


def run():
    chatbot = ChatBot()
    print("\n<< Yomi AI | Work in Progress >>\n")
    while True:
        usr_input = input("U S E R || ")
        if usr_input == 'quit' or usr_input == 'exit':
            break
        intent = chatbot.intent_model.predict(usr_input)
        if intent == 0:
            emotion = chatbot.emotion_model.predict(usr_input)
            answer = chatbot.text_model.generate_answer(usr_input)
            print("CHATBOT ||", answer)
            print(f"[Intent: {intent} | Emotion: {emotion}]")
        elif intent == 1:
            dish_name = chatbot.ner_model.predict(usr_input)
            print(f"[Intent: {intent} | DISH: {dish_name}]")


if __name__ == "__main__":
    run()
