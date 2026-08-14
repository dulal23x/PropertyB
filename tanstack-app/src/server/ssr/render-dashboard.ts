/**
 * Server-Side Rendered Owner Dashboard
 */

import { renderHtmlDocument } from "./html-template";
import type { AppEnv } from "../types/env";

export function renderDashboardPage(pathname: string, env: AppEnv): Response {
  const content = `
  <div class="bg-gray-50 min-h-screen py-8 md:py-12">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      <!-- Dashboard Top Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 mb-8 border-b border-gray-200">
        <div>
          <span class="text-xs font-black uppercase tracking-widest text-brand-green">Client Portal</span>
          <h1 class="text-2xl md:text-3xl font-black uppercase tracking-tight text-brand-dark">Owner Dashboard</h1>
          <p id="owner-greeting" class="text-xs text-gray-500 mt-1">Manage your properties and buyer inquiries</p>
        </div>
        <div class="flex items-center gap-3">
          <button onclick="openNewListingModal()" class="inline-flex items-center gap-2 bg-brand-green text-white px-4 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider hover:bg-brand-greenHover transition-all shadow">
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"></path></svg>
            Post New Listing
          </button>
          <button onclick="handleLogout()" class="border border-gray-300 bg-white text-gray-700 px-3.5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-gray-50 transition-colors">
            Sign Out
          </button>
        </div>
      </div>

      <!-- Metric Summary Cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div class="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <span class="text-[11px] font-black uppercase tracking-wider text-gray-500">Total Listings</span>
          <div id="stat-total" class="text-2xl font-black text-brand-dark mt-2">--</div>
        </div>
        <div class="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <span class="text-[11px] font-black uppercase tracking-wider text-gray-500">Published</span>
          <div id="stat-published" class="text-2xl font-black text-brand-green mt-2">--</div>
        </div>
        <div class="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <span class="text-[11px] font-black uppercase tracking-wider text-gray-500">Pending Review</span>
          <div id="stat-pending" class="text-2xl font-black text-amber-500 mt-2">--</div>
        </div>
        <div class="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <span class="text-[11px] font-black uppercase tracking-wider text-gray-500">Inquiries Received</span>
          <div id="stat-inquiries" class="text-2xl font-black text-blue-600 mt-2">--</div>
        </div>
      </div>

      <!-- Properties Management Table -->
      <div class="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-10">
        <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 class="text-sm font-black uppercase tracking-wider text-brand-dark">My Properties</h2>
          <button onclick="loadDashboardData()" class="text-xs font-bold text-brand-green hover:underline">Refresh</button>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-xs">
            <thead>
              <tr class="bg-gray-50 text-gray-500 uppercase tracking-wider text-[10px] font-black border-b border-gray-100">
                <th class="py-3 px-6">Property</th>
                <th class="py-3 px-6">Type & Location</th>
                <th class="py-3 px-6">Price</th>
                <th class="py-3 px-6">Status</th>
                <th class="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody id="listings-tbody" class="divide-y divide-gray-100 text-gray-700 font-semibold">
              <tr>
                <td colspan="5" class="py-8 text-center text-gray-400">Loading your listings...</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Recent Inquiries Section -->
      <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <h2 class="text-sm font-black uppercase tracking-wider text-brand-dark mb-4 pb-2 border-b border-gray-100">
          Inquiries Inbox
        </h2>
        <div id="inquiries-list" class="space-y-3">
          <p class="text-xs text-gray-400 text-center py-4">No buyer inquiries received yet.</p>
        </div>
      </div>

    </div>
  </div>

  <!-- Create Listing Modal -->
  <div id="new-listing-modal" class="hidden fixed inset-0 z-50 overflow-y-auto">
    <div class="fixed inset-0 bg-black/50" onclick="closeNewListingModal()"></div>
    <div class="relative min-h-screen flex items-center justify-center p-4">
      <div class="relative bg-white rounded-2xl max-w-2xl w-full p-6 md:p-8 shadow-2xl border border-gray-200">
        <div class="flex items-center justify-between pb-4 mb-6 border-b border-gray-100">
          <h3 class="text-lg font-black uppercase tracking-wider text-brand-dark">Create New Property Listing</h3>
          <button onclick="closeNewListingModal()" class="text-gray-400 hover:text-black">✕</button>
        </div>

        <form id="create-listing-form" onsubmit="handleCreateListing(event)" class="space-y-4 text-xs">
          <div>
            <label class="block font-black uppercase tracking-wider text-gray-700 mb-1">Listing Title</label>
            <input type="text" id="prop-title" placeholder="e.g. Luxurious 3 BHK Apartment in Gulshan 2" required class="w-full rounded-lg border border-gray-300 px-3.5 py-2 font-semibold focus:border-brand-green focus:outline-none" />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block font-black uppercase tracking-wider text-gray-700 mb-1">Purpose</label>
              <select id="prop-purpose" class="w-full rounded-lg border border-gray-300 px-3.5 py-2 font-semibold focus:border-brand-green focus:outline-none">
                <option value="sale">For Sale</option>
                <option value="rent">For Rent</option>
              </select>
            </div>
            <div>
              <label class="block font-black uppercase tracking-wider text-gray-700 mb-1">Property Type</label>
              <select id="prop-type" class="w-full rounded-lg border border-gray-300 px-3.5 py-2 font-semibold focus:border-brand-green focus:outline-none">
                <option value="apartment">Apartment</option>
                <option value="house">House</option>
                <option value="land">Plot / Land</option>
                <option value="commercial">Commercial</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block font-black uppercase tracking-wider text-gray-700 mb-1">Area / Neighborhood</label>
              <input type="text" id="prop-area" placeholder="e.g. Gulshan, Banani, Uttara" required class="w-full rounded-lg border border-gray-300 px-3.5 py-2 font-semibold focus:border-brand-green focus:outline-none" />
            </div>
            <div>
              <label class="block font-black uppercase tracking-wider text-gray-700 mb-1">City</label>
              <input type="text" id="prop-city" value="Dhaka" required class="w-full rounded-lg border border-gray-300 px-3.5 py-2 font-semibold focus:border-brand-green focus:outline-none" />
            </div>
          </div>

          <div class="grid grid-cols-3 gap-4">
            <div>
              <label class="block font-black uppercase tracking-wider text-gray-700 mb-1">Price (BDT)</label>
              <input type="number" id="prop-price" placeholder="e.g. 25000000" class="w-full rounded-lg border border-gray-300 px-3.5 py-2 font-semibold focus:border-brand-green focus:outline-none" />
            </div>
            <div>
              <label class="block font-black uppercase tracking-wider text-gray-700 mb-1">Bedrooms</label>
              <input type="number" id="prop-beds" placeholder="3" class="w-full rounded-lg border border-gray-300 px-3.5 py-2 font-semibold focus:border-brand-green focus:outline-none" />
            </div>
            <div>
              <label class="block font-black uppercase tracking-wider text-gray-700 mb-1">Size (Sqft)</label>
              <input type="number" id="prop-size" placeholder="1850" class="w-full rounded-lg border border-gray-300 px-3.5 py-2 font-semibold focus:border-brand-green focus:outline-none" />
            </div>
          </div>

          <div>
            <label class="block font-black uppercase tracking-wider text-gray-700 mb-1">Full Description</label>
            <textarea id="prop-desc" rows="3" placeholder="Provide complete information on floor level, fittings, parking, generator, etc." class="w-full rounded-lg border border-gray-300 px-3.5 py-2 font-semibold focus:border-brand-green focus:outline-none"></textarea>
          </div>

          <div class="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button type="button" onclick="closeNewListingModal()" class="px-4 py-2 border border-gray-300 rounded-lg font-bold text-gray-700 hover:bg-gray-50">Cancel</button>
            <button type="submit" id="save-prop-btn" class="px-6 py-2 bg-brand-green text-white font-black uppercase tracking-wider rounded-lg hover:bg-brand-greenHover shadow">Save Draft</button>
          </div>
        </form>
      </div>
    </div>
  </div>`;

  const scripts = `
  <script>
    const token = localStorage.getItem('realestate_token');
    if (!token) {
      window.location.href = '/auth/login';
    }

    async function loadDashboardData() {
      try {
        const [meRes, sumRes, listRes, inqRes] = await Promise.all([
          fetch('/api/auth/me', { headers: { 'Authorization': 'Bearer ' + token } }),
          fetch('/api/properties/me-summary', { headers: { 'Authorization': 'Bearer ' + token } }),
          fetch('/api/properties/me', { headers: { 'Authorization': 'Bearer ' + token } }),
          fetch('/api/properties/me/inquiries', { headers: { 'Authorization': 'Bearer ' + token } })
        ]);

        if (meRes.status === 401) {
          localStorage.removeItem('realestate_token');
          window.location.href = '/auth/login';
          return;
        }

        const me = await meRes.json();
        const sum = await sumRes.json();
        const list = await listRes.json();
        const inq = await inqRes.json();

        if (me && me.full_name) {
          document.getElementById('owner-greeting').textContent = 'Welcome back, ' + me.full_name + ' (' + me.email + ')';
        }

        document.getElementById('stat-total').textContent = sum.total_listings || 0;
        document.getElementById('stat-published').textContent = sum.published || 0;
        document.getElementById('stat-pending').textContent = sum.pending_review || 0;
        document.getElementById('stat-inquiries').textContent = sum.total_inquiries || 0;

        // Populate Table
        const tbody = document.getElementById('listings-tbody');
        if (list.items && list.items.length > 0) {
          tbody.innerHTML = list.items.map(item => {
            const statusClass = item.status === 'published' ? 'bg-green-100 text-green-800' : (item.status === 'pending_review' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-800');
            return '<tr class="hover:bg-gray-50">' +
              '<td class="py-3 px-6"><a href="/properties/' + item.slug + '" class="font-bold text-brand-dark hover:text-brand-green">' + (item.title || 'Untitled') + '</a></td>' +
              '<td class="py-3 px-6">' + (item.property_type || '') + ' - ' + (item.area_name || item.city || '') + '</td>' +
              '<td class="py-3 px-6 font-bold">' + (item.price_amount ? 'BDT ' + Number(item.price_amount).toLocaleString('en-IN') : 'Call') + '</td>' +
              '<td class="py-3 px-6"><span class="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ' + statusClass + '">' + item.status + '</span></td>' +
              '<td class="py-3 px-6 text-right space-x-2">' +
                (item.status === 'draft' ? '<button onclick="submitForReview(' + item.id + ')" class="text-[11px] font-bold text-brand-green hover:underline">Submit for Review</button>' : '') +
                '<a href="/properties/' + item.slug + '" class="text-[11px] font-bold text-gray-500 hover:text-black">View</a>' +
              '</td>' +
            '</tr>';
          }).join('');
        } else {
          tbody.innerHTML = '<tr><td colspan="5" class="py-8 text-center text-gray-400">No properties posted yet. Click "Post New Listing" to create your first draft.</td></tr>';
        }

        // Populate Inquiries
        const inqContainer = document.getElementById('inquiries-list');
        if (inq.items && inq.items.length > 0) {
          inqContainer.innerHTML = inq.items.map(msg => {
            return '<div class="p-4 rounded-xl border border-gray-100 bg-gray-50">' +
              '<div class="flex items-center justify-between mb-1">' +
                '<span class="font-bold text-sm text-brand-dark">' + (msg.name || 'Anonymous') + ' &bull; ' + (msg.phone || '') + '</span>' +
                '<span class="text-[10px] text-gray-500">' + new Date(msg.created_at).toLocaleDateString() + '</span>' +
              '</div>' +
              '<p class="text-xs text-gray-700">' + (msg.message || 'Interested in property ID: ' + msg.listing_id) + '</p>' +
            '</div>';
          }).join('');
        }
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      }
    }

    async function submitForReview(id) {
      if (!confirm('Submit this listing for administrator review and publishing?')) return;
      try {
        const res = await fetch('/api/properties/me/' + id + '/submit', {
          method: 'POST',
          headers: { 'Authorization': 'Bearer ' + token }
        });
        if (res.ok) {
          alert('Listing submitted for review!');
          loadDashboardData();
        } else {
          const d = await res.json();
          alert(d.detail || 'Submission failed');
        }
      } catch (e) {
        alert('Network error');
      }
    }

    function openNewListingModal() {
      document.getElementById('new-listing-modal').classList.remove('hidden');
    }
    function closeNewListingModal() {
      document.getElementById('new-listing-modal').classList.add('hidden');
    }

    async function handleCreateListing(e) {
      e.preventDefault();
      const btn = document.getElementById('save-prop-btn');
      btn.disabled = true;
      btn.textContent = 'Saving...';

      const payload = {
        title: document.getElementById('prop-title').value,
        listing_purpose: document.getElementById('prop-purpose').value,
        property_type: document.getElementById('prop-type').value,
        area_name: document.getElementById('prop-area').value,
        city: document.getElementById('prop-city').value,
        price_amount: Number(document.getElementById('prop-price').value) || undefined,
        bedrooms: Number(document.getElementById('prop-beds').value) || undefined,
        size_value: Number(document.getElementById('prop-size').value) || undefined,
        description: document.getElementById('prop-desc').value || undefined
      };

      try {
        const res = await fetch('/api/properties', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
          },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          closeNewListingModal();
          document.getElementById('create-listing-form').reset();
          loadDashboardData();
        } else {
          const d = await res.json();
          alert(d.detail || 'Failed to create listing');
        }
      } catch (err) {
        alert('Network error');
      } finally {
        btn.disabled = false;
        btn.textContent = 'Save Draft';
      }
    }

    function handleLogout() {
      localStorage.removeItem('realestate_token');
      window.location.href = '/';
    }

    loadDashboardData();
  </script>`;

  return new Response(
    renderHtmlDocument({
      meta: {
        title: "Owner Dashboard | PropertyBikri",
        description: "Manage your property listings and buyer inquiries on PropertyBikri.",
        canonical: "/dashboard",
        noIndex: true,
      },
      content,
      scripts,
    }),
    { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } }
  );
}
