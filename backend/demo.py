import logging

logger = logging.getLogger(__name__)
logging.basicConfig(filename='general.log')
def ispalindrome(word):
  if word == word[::-1]:
    return logger.info(f"{word} is a palindrome") 
  else: 
    return logger.info(f"{word} is not a palindrome")
    
ispalindrome("Eye")
ispalindrome("car")