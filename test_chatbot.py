import csv
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

# --- Function to ask a question ---
def ask_question(question):
    # Load FAQ data
    faq_data = load_faq_data('faqs.csv')
    
    # Find the best matching FAQ
    match = find_best_match(question, faq_data)
    
    if match:
        print("Answer:")
        print(match['answer'])
        print("\nSource Documents Used:")
        print(f"- {match['question']}")
    else:
        print("Answer:")
        print("I don't know the answer to that question.")
        print("\nSource Documents Used:")
        print("- No relevant document found")

# --- Example Usage ---
if __name__ == "__main__":
    # Example questions
    print("Running example questions:\n")
    
    user_question = "What is Income Tax Return?"
    print(f"Question: {user_question}")
    ask_question(user_question)

    print("\n" + "="*50 + "\n")

    user_question_2 = "How can I save tax using Section 80C?"
    print(f"Question: {user_question_2}")
    ask_question(user_question_2)
    
    print("\n" + "="*50 + "\n")
    
    user_question_3 = "What is the difference between old and new tax regime?"
    print(f"Question: {user_question_3}")
    ask_question(user_question_3)