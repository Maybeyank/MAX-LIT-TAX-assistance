import csv
import re
from difflib import SequenceMatcher

# Load FAQ data from CSV
def load_faq_data(filename):
    faq_data = []
    with open(filename, 'r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        for row in reader:
            faq_data.append({
                'category': row['category'],
                'question': row['question'],
                'answer': row['answer']
            })
    return faq_data

# Find the most similar question
def find_best_match(user_question, faq_data):
    best_match = None
    highest_similarity = 0
    
    for faq in faq_data:
        similarity = SequenceMatcher(None, user_question.lower(), faq['question'].lower()).ratio()
        if similarity > highest_similarity:
            highest_similarity = similarity
            best_match = faq
    
    # Only return a match if similarity is above a threshold
    if highest_similarity > 0.6:
        return best_match
    return None

# Chatbot function
def chatbot():
    print("Welcome to the Income Tax FAQ Chatbot!")
    print("Ask me any question about income tax filing, and I'll do my best to help.")
    print("Type 'quit' to exit.\n")
    
    # Load FAQ data
    faq_data = load_faq_data('faqs.csv')
    
    while True:
        user_input = input("You: ").strip()
        
        if user_input.lower() in ['quit', 'exit', 'bye']:
            print("Chatbot: Goodbye! Feel free to come back if you have more tax questions.")
            break
        
        if not user_input:
            print("Chatbot: Please ask a question.")
            continue
        
        # Find the best matching FAQ
        match = find_best_match(user_input, faq_data)
        
        if match:
            print(f"Chatbot: {match['answer']}\n")
        else:
            print("Chatbot: I'm sorry, I don't have information on that specific question. Please try rephrasing or ask another question.\n")

if __name__ == "__main__":
    chatbot()