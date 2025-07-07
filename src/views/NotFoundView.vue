<template>
  <div class="flex flex-col justify-center items-center mt-5  py-10">
    <img src="img/404.png" alt="404" class="w-[300px]">
    <div class="bg-red-500 text-white px-5 py-2 mt-10 text-[30px] font-medium">Oops, siden findes desværre ikke!</div>
    <div class=" text-gray-700 font-light px-5 py-2 mt-2 text-[17px]">Mener du dette er en fejl, bør du kontakte vores kundeservicer <span class="underline">her</span> - Det vil vi værdsætte!</div>
    <RouterLink to="/" class="btn !mt-10">Tilbage til forsiden</RouterLink>
  </div>
</template>