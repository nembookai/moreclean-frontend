<template>
  <div>
    <div class="box !text-sm p-4 !shadow-xl w-[700px]">
      <div class="grid grid-cols-3 gap-4">
        <div>
          <div class="text-lg text-gray-700 font-light mb-1 flex items-center gap-x-1">
            <PhUser :size="18" weight="regular" /> Om kunden
          </div>
          <div class="mb-3">
            <div class="text-sm text-gray-600 font-light">Navn</div>
            <div class="font-light text-gray-700">{{ customer.name || '---' }}</div>
          </div>
          <div class="mb-3">
            <div class="text-sm text-gray-600 font-light">Kundenr.</div>
            <div class="font-light text-gray-700">{{ customer.number || '---' }}</div>
          </div>
          <div class="mb-3">
            <div class="text-sm text-gray-600 font-light">Kundetype</div>
            <div class="font-light text-gray-700">{{ customer.type === 'company' ? 'Virksomhed' : 'Privatperson' }}</div>
          </div>
          <div class="mb-3">
            <div class="text-sm text-gray-600 font-light">CVR</div>
            <div class="font-light text-gray-700">{{ customer.cvr || '---' }}</div>
          </div>
          <div class="mb-3">
            <div class="text-sm text-gray-600 font-light">Debitor nr</div>
            <div class="font-light text-gray-700">{{ customer.debit_number || '---' }}</div>
          </div>
        </div>
        <div>
          <div class="text-lg text-gray-700 font-light mb-1 flex items-center gap-x-1">
            <PhAlignLeftSimple :size="18" weight="regular" /> Kontaktoplysninger
          </div>
          <div class="mb-3">
            <div class="text-sm text-gray-600 font-light">Email</div>
            <div class="font-light text-gray-700">{{ customer.email || '---' }}</div>
          </div>
          <div class="mb-3" v-if="customer.type === 'company'">
            <div class="text-sm text-gray-600 font-light">Fakturerings e-mail</div>
            <div class="font-light text-gray-700">{{ customer.invoice_email || '---' }}</div>
          </div>
          <div class="mb-3">
            <div class="text-sm text-gray-600 font-light">Telefon</div>
            <div class="font-light text-gray-700">{{ customer.phone || '---' }}</div>
          </div>
          <div class="mb-3">
            <div class="text-sm text-gray-600 font-light">Kontaktperson</div>
            <div class="font-light text-gray-700">{{ customer.contact_person_name || '---' }}</div>
          </div>
          <div class="mb-3">
            <div class="text-sm text-gray-600 font-light">Kontaktperson Telefon</div>
            <div class="font-light text-gray-700">{{ customer.contact_person_phone || '---' }}</div>
          </div>
          <div class="mb-3">
            <div class="text-sm text-gray-600 font-light">Kontaktperson Email</div>
            <div class="font-light text-gray-700">{{ customer.contact_person_email || '---' }}</div>
          </div>
        </div>
        <div>
          <div class="text-lg text-gray-700 font-light mb-1 flex items-center gap-x-1">
            <PhMapPin :size="18" weight="regular" /> Kundeadresse
          </div>
          <div class="mb-3">
            <div class="text-sm text-gray-600 font-light">Adresse:</div>
            <div class="font-light text-gray-700">{{ customer.address || '---' }}</div>
          </div>
          <div class="mb-3">
            <div class="text-sm text-gray-600 font-light">Postnr. / By:</div>
            <div class="font-light text-gray-700">
              <span v-if="customer.zip">{{ customer.zip }}</span>
              <span v-if="customer.zip && customer.city">, </span>
              <span v-if="customer.city">{{ customer.city }}</span>
              <span v-if="!customer.zip && !customer.city">---</span>
            </div>
          </div>
          <div class="mb-3">
            <div class="text-sm text-gray-600 font-light">Oprettet:</div>
            <div class="font-light text-gray-700">{{ moment(customer.created_at).format('DD/MM/YYYY') }}</div>
          </div>
          <div class="mb-3">
            <div class="text-sm text-gray-600 font-light">Sidst opdateret:</div>
            <div class="font-light text-gray-700">{{ moment(customer.updated_at).format('DD/MM/YYYY') }}</div>
          </div>
          <div class="mb-3">
            <div class="text-sm text-gray-600 font-light">Farve:</div>
            <span class="inline-block w-8 h-3 rounded-full align-middle" :style="{ backgroundColor: customer.color }"></span>
          </div>
          <div class="mb-3">
            <div class="text-sm text-gray-600 font-light">E-conomic:</div>
            <div class="font-light text-gray-700">
              <PhCheck v-if="customer.economic_id" :size="16" class="text-green-600" weight="bold" />
              <PhX v-else :size="16" class="text-red-600" weight="bold" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { PhUser, PhAlignLeftSimple, PhMapPin, PhCheck, PhX } from '@phosphor-icons/vue';
import moment from 'moment';

const props = defineProps(['customer']);
</script>