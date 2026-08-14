/**
 * Server-Side Rendered Administrator Moderation Control Panel
 */

import { renderHtmlDocument } from "./html-template";
import type { AppEnv } from "../types/env";

export function renderAdminPage(pathname: string, env: AppEnv): Response {
  const content = `
  <div class="bg-gray-50 min-h-screen py-8 md:py-12">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      <!-- Admin Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 mb-8 border-b border-gray-200">
        <div>
          <span class="text-xs font-black uppercase tracking-widest text-red-600 bg-red-50 px-2 py-0.5 rounded">Administrator Portal</span>
          <h1 class="text-2xl md:text-3xl font-black uppercase tracking-tight text-brand-dark mt-1">Moderation & Site Control</h1>
        </div>
        <div class="flex items-center gap-3">
          <button onclick="loadAdminData()" class="bg-brand-green text-white px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider hover:bg-brand-greenHover transition-all shadow">
            Refresh Data
          </button>
          <button onclick="handleLogout()" class="border border-gray-300 bg-white text-gray-700 px-3.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-gray-50 transition-colors">
            Sign Out
          </button>
        </div>
      </div>

      <!-- Moderation Stats Metrics -->
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <div class="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <span class="text-[10px] font-black uppercase tracking-wider text-gray-500">Total Properties</span>
          <div id="adm-total" class="text-2xl font-black text-brand-dark mt-1">--</div>
        </div>
        <div class="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <span class="text-[10px] font-black uppercase tracking-wider text-amber-600">Pending Review</span>
          <div id="adm-pending" class="text-2xl font-black text-amber-600 mt-1">--</div>
        </div>
        <div class="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <span class="text-[10px] font-black uppercase tracking-wider text-brand-green">Published</span>
          <div id="adm-published" class="text-2xl font-black text-brand-green mt-1">--</div>
        </div>
        <div class="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <span class="text-[10px] font-black uppercase tracking-wider text-gray-500">Drafts / Rejected</span>
          <div id="adm-drafts" class="text-2xl font-black text-gray-600 mt-1">--</div>
        </div>
        <div class="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <span class="text-[10px] font-black uppercase tracking-wider text-blue-600">Total Users</span>
          <div id="adm-users" class="text-2xl font-black text-blue-600 mt-1">--</div>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <div class="flex items-center gap-2 border-b border-gray-200 mb-6 pb-2 overflow-x-auto text-xs font-black uppercase tracking-wider">
        <button onclick="switchTab('moderation')" id="adm-tab-moderation" class="adm-tab-btn py-2 px-4 rounded-lg bg-brand-green text-white">Listings Moderation</button>
        <button onclick="switchTab('users')" id="adm-tab-users" class="adm-tab-btn py-2 px-4 rounded-lg text-gray-600 hover:bg-gray-100">Users</button>
        <button onclick="switchTab('inquiries')" id="adm-tab-inquiries" class="adm-tab-btn py-2 px-4 rounded-lg text-gray-600 hover:bg-gray-100">Inquiries</button>
        <button onclick="switchTab('settings')" id="adm-tab-settings" class="adm-tab-btn py-2 px-4 rounded-lg text-gray-600 hover:bg-gray-100">Site Settings</button>
      </div>

      <!-- Panel: Moderation Queue -->
      <div id="panel-moderation" class="adm-panel bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-10">
        <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 class="text-sm font-black uppercase tracking-wider text-brand-dark">Property Listings Moderation Queue</h2>
          <div class="flex gap-2">
            <select id="status-filter" onchange="loadAdminData()" class="rounded-lg border border-gray-300 text-xs px-2.5 py-1 font-bold">
              <option value="">All Statuses</option>
              <option value="pending_review">Pending Review Only</option>
              <option value="published">Published Only</option>
              <option value="draft">Draft Only</option>
              <option value="archived">Archived Only</option>
            </select>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-xs">
            <thead>
              <tr class="bg-gray-50 text-gray-500 uppercase tracking-wider text-[10px] font-black border-b border-gray-100">
                <th class="py-3 px-6">ID & Title</th>
                <th class="py-3 px-6">Type & Location</th>
                <th class="py-3 px-6">Price</th>
                <th class="py-3 px-6">Status</th>
                <th class="py-3 px-6 text-right">Moderation Actions</th>
              </tr>
            </thead>
            <tbody id="adm-listings-tbody" class="divide-y divide-gray-100 font-semibold text-gray-700">
              <tr>
                <td colspan="5" class="py-8 text-center text-gray-400">Loading listings queue...</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Panel: Users -->
      <div id="panel-users" class="adm-panel hidden bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-10">
        <h2 class="text-sm font-black uppercase tracking-wider text-brand-dark mb-4">User Accounts</h2>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead>
              <tr class="bg-gray-50 text-[10px] font-black uppercase tracking-wider text-gray-500 border-b">
                <th class="py-2.5 px-4">ID</th>
                <th class="py-2.5 px-4">Name & Email</th>
                <th class="py-2.5 px-4">Role</th>
                <th class="py-2.5 px-4">Status</th>
                <th class="py-2.5 px-4">Password State</th>
              </tr>
            </thead>
            <tbody id="adm-users-tbody" class="divide-y divide-gray-100"></tbody>
          </table>
        </div>
      </div>

      <!-- Panel: Inquiries -->
      <div id="panel-inquiries" class="adm-panel hidden bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-10">
        <h2 class="text-sm font-black uppercase tracking-wider text-brand-dark mb-4">Global Inquiries</h2>
        <div id="adm-inquiries-list" class="space-y-3 text-xs"></div>
      </div>

      <!-- Panel: Settings -->
      <div id="panel-settings" class="adm-panel hidden bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-10 max-w-xl">
        <h2 class="text-sm font-black uppercase tracking-wider text-brand-dark mb-4">Global Site Settings</h2>
        <form onsubmit="handleSaveSettings(event)" class="space-y-4 text-xs">
          <div>
            <label class="block font-black uppercase tracking-wider text-gray-700 mb-1">Global Fallback Contact Phone</label>
            <input type="text" id="setting-phone" value="+8801700000000" class="w-full rounded-lg border border-gray-300 px-3 py-2 font-semibold" />
          </div>
          <button type="submit" class="bg-brand-green text-white font-black uppercase tracking-wider px-6 py-2 rounded-lg hover:bg-brand-greenHover shadow">Save Settings</button>
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

    async function loadAdminData() {
      try {
        const meRes = await fetch('/api/auth/me', { headers: { 'Authorization': 'Bearer ' + token } });
        if (!meRes.ok) { window.location.href = '/auth/login'; return; }
        const me = await meRes.json();
        if (me.role !== 'admin') {
          alert('Access restricted to administrators only.');
          window.location.href = '/dashboard';
          return;
        }

        const status = document.getElementById('status-filter').value;
        const query = status ? '?status=' + status : '';

        const [propsRes, statsRes, usersRes, inqRes] = await Promise.all([
          fetch('/api/admin/properties' + query, { headers: { 'Authorization': 'Bearer ' + token } }),
          fetch('/api/admin/properties/stats', { headers: { 'Authorization': 'Bearer ' + token } }),
          fetch('/api/admin/users', { headers: { 'Authorization': 'Bearer ' + token } }),
          fetch('/api/admin/inquiries', { headers: { 'Authorization': 'Bearer ' + token } })
        ]);

        const props = await propsRes.json();
        const stats = await statsRes.json();
        const users = await usersRes.json();
        const inqs = await inqRes.json();

        // Metrics
        document.getElementById('adm-total').textContent = stats.total || (props.items ? props.items.length : 0);
        document.getElementById('adm-published').textContent = stats.published || 0;
        document.getElementById('adm-pending').textContent = stats.pending_review || 0;
        document.getElementById('adm-drafts').textContent = (stats.draft || 0) + (stats.rejected || 0);
        document.getElementById('adm-users').textContent = users.length || 0;

        // Render Listings Table
        const tbody = document.getElementById('adm-listings-tbody');
        if (props.items && props.items.length > 0) {
          tbody.innerHTML = props.items.map(p => {
            const statusBadge = p.status === 'published' 
              ? '<span class="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-green-100 text-green-800">Published</span>'
              : (p.status === 'pending_review' 
                ? '<span class="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-800">Pending Review</span>'
                : '<span class="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-gray-100 text-gray-700">' + p.status + '</span>');

            return '<tr class="hover:bg-gray-50">' +
              '<td class="py-3 px-6"><span class="text-gray-400 font-mono">#' + p.id + '</span> <a href="/properties/' + p.slug + '" class="font-bold text-brand-dark hover:text-brand-green ml-1">' + (p.title || 'Untitled') + '</a></td>' +
              '<td class="py-3 px-6">' + (p.property_type || '') + ' - ' + (p.area_name || p.city || '') + '</td>' +
              '<td class="py-3 px-6 font-bold">' + (p.price_amount ? 'BDT ' + Number(p.price_amount).toLocaleString('en-IN') : 'Call') + '</td>' +
              '<td class="py-3 px-6">' + statusBadge + '</td>' +
              '<td class="py-3 px-6 text-right space-x-2">' +
                (p.status !== 'published' ? '<button onclick="approveListing(' + p.id + ')" class="bg-brand-green text-white px-2.5 py-1 rounded text-[10px] font-black uppercase hover:bg-brand-greenHover">Approve</button>' : '') +
                (p.status === 'published' ? '<button onclick="unpublishListing(' + p.id + ')" class="bg-amber-500 text-white px-2.5 py-1 rounded text-[10px] font-black uppercase hover:bg-amber-600">Unpublish</button>' : '') +
                (p.status !== 'archived' ? '<button onclick="archiveListing(' + p.id + ')" class="bg-gray-200 text-gray-800 px-2.5 py-1 rounded text-[10px] font-black uppercase hover:bg-gray-300">Archive</button>' : '') +
                '<a href="/properties/' + p.slug + '" class="text-[11px] font-bold text-gray-500 hover:text-black">View</a>' +
              '</td>' +
            '</tr>';
          }).join('');
        } else {
          tbody.innerHTML = '<tr><td colspan="5" class="py-8 text-center text-gray-400">No listings matching filter.</td></tr>';
        }

        // Render Users
        const usersTbody = document.getElementById('adm-users-tbody');
        if (users && users.length > 0) {
          usersTbody.innerHTML = users.map(u => {
            return '<tr class="hover:bg-gray-50">' +
              '<td class="py-2.5 px-4 font-mono">#' + u.id + '</td>' +
              '<td class="py-2.5 px-4"><span class="font-bold">' + (u.full_name || 'No Name') + '</span> <br/><span class="text-gray-500">' + u.email + '</span></td>' +
              '<td class="py-2.5 px-4 font-bold uppercase text-[10px]">' + u.role + '</td>' +
              '<td class="py-2.5 px-4">' + (u.is_active ? '<span class="text-green-600 font-bold">Active</span>' : '<span class="text-red-500 font-bold">Inactive</span>') + '</td>' +
              '<td class="py-2.5 px-4 text-gray-500 text-[11px]">' + (u.password_reset_required ? '<span class="text-amber-600 font-bold">Reset Required</span>' : 'Standard') + '</td>' +
            '</tr>';
          }).join('');
        }

        // Render Inquiries
        const inqList = document.getElementById('adm-inquiries-list');
        if (inqs && inqs.length > 0) {
          inqList.innerHTML = inqs.map(i => {
            return '<div class="p-3 bg-gray-50 rounded-xl border border-gray-100">' +
              '<div class="flex items-center justify-between mb-1">' +
                '<span class="font-bold text-brand-dark">' + (i.name || 'Anonymous') + ' &bull; ' + (i.phone || '') + ' (Listing #' + i.listing_id + ')</span>' +
                '<span class="text-gray-400">' + new Date(i.created_at).toLocaleDateString() + '</span>' +
              '</div>' +
              '<p class="text-gray-700">' + (i.message || 'No message text') + '</p>' +
            '</div>';
          }).join('');
        }
      } catch (err) {
        console.error('Error loading admin data:', err);
      }
    }

    async function approveListing(id) {
      if (!confirm('Approve and publish listing #' + id + '?')) return;
      try {
        const res = await fetch('/api/admin/properties/' + id + '/approve', {
          method: 'POST',
          headers: { 'Authorization': 'Bearer ' + token }
        });
        if (res.ok) {
          alert('Listing approved & published!');
          loadAdminData();
        } else {
          alert('Action failed');
        }
      } catch (e) { alert('Network error'); }
    }

    async function unpublishListing(id) {
      if (!confirm('Unpublish listing #' + id + '?')) return;
      try {
        const res = await fetch('/api/admin/properties/' + id + '/unpublish', {
          method: 'POST',
          headers: { 'Authorization': 'Bearer ' + token }
        });
        if (res.ok) {
          alert('Listing unpublished');
          loadAdminData();
        }
      } catch (e) { alert('Network error'); }
    }

    async function archiveListing(id) {
      if (!confirm('Archive listing #' + id + '?')) return;
      try {
        const res = await fetch('/api/admin/properties/' + id + '/archive', {
          method: 'POST',
          headers: { 'Authorization': 'Bearer ' + token }
        });
        if (res.ok) {
          alert('Listing archived');
          loadAdminData();
        }
      } catch (e) { alert('Network error'); }
    }

    function switchTab(tab) {
      document.querySelectorAll('.adm-panel').forEach(el => el.classList.add('hidden'));
      document.querySelectorAll('.adm-tab-btn').forEach(el => {
        el.classList.remove('bg-brand-green', 'text-white');
        el.classList.add('text-gray-600');
      });
      const p = document.getElementById('panel-' + tab);
      const b = document.getElementById('adm-tab-' + tab);
      if (p) p.classList.remove('hidden');
      if (b) {
        b.classList.remove('text-gray-600');
        b.classList.add('bg-brand-green', 'text-white');
      }
    }

    async function handleSaveSettings(e) {
      e.preventDefault();
      const val = document.getElementById('setting-phone').value;
      try {
        const res = await fetch('/api/admin/settings/global_contact_phone', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
          body: JSON.stringify({ value: val })
        });
        if (res.ok) alert('Settings saved successfully');
      } catch (err) { alert('Network error'); }
    }

    function handleLogout() {
      localStorage.removeItem('realestate_token');
      window.location.href = '/';
    }

    loadAdminData();
  </script>`;

  return new Response(
    renderHtmlDocument({
      meta: {
        title: "Admin Moderation Control | PropertyBikri",
        description: "Administrative moderation panel for PropertyBikri.",
        canonical: "/admin",
        noIndex: true,
      },
      content,
      scripts,
    }),
    { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } }
  );
}
