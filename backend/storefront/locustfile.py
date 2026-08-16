from locust import HttpUser, task, between
import random
#id = random.randint(1, 100)

class ShopUser(HttpUser):
  wait_time=between(1,5)
  #@task(10)
  #def browseproducts(self):
    #self.client.get("/products")

  #@task(8)
  #def browseindividualproducts(self):
    #id=random.choice([1,3,7,15,22])
    #self.client.get(f"/products/{id}")
  

 # @task(7)
  #def browseindividualreviews(self):
    #id = random.choice([1, 3, 7, 15, 22])
    #self.client.get(f"/products/{id}/reviews")

  @task(6)
  def browsecarts(self):
    self.client.get(f"/carts")